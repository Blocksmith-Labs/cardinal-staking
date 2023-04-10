use crate::errors::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_spl::token::Mint;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::{self};
use cardinal_stake_pool::state::GroupStakeEntry;
use std::cmp::min;

#[derive(Accounts)]
pub struct ClaimGroupRewardsCtx<'info> {
    #[account(mut, has_one = authority)]
    group_entry: Box<Account<'info, GroupStakeEntry>>,

    #[account(mut, has_one = authority, has_one = group_reward_distributor)]
    group_reward_counter: Box<Account<'info, GroupRewardCounter>>,

    #[account(mut, has_one = group_entry, has_one = group_reward_distributor)]
    group_reward_entry: Box<Account<'info, GroupRewardEntry>>,

    #[account(mut)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    #[account(mut, constraint = reward_mint.key() == group_reward_distributor.reward_mint @ ErrorCode::InvalidRewardMint)]
    reward_mint: Box<Account<'info, Mint>>,

    #[account(mut, constraint = user_reward_mint_token_account.mint == group_reward_distributor.reward_mint @ ErrorCode::InvalidUserRewardMintTokenAccount)]
    user_reward_mint_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut, constraint = assert_reward_manager(&reward_manager.key()))]
    reward_manager: UncheckedAccount<'info>,

    #[account(mut)]
    authority: Signer<'info>,

    token_program: Program<'info, Token>,

    system_program: Program<'info, System>,
}

pub fn handler<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, ClaimGroupRewardsCtx<'info>>) -> Result<()> {
    let group_reward_counter = &mut ctx.accounts.group_reward_counter;
    let group_entry = &mut ctx.accounts.group_entry;
    let group_reward_entry = &mut ctx.accounts.group_reward_entry;
    let group_reward_distributor = &mut ctx.accounts.group_reward_distributor;
    let group_reward_distributor_seed = &[GROUP_REWARD_DISTRIBUTOR_SEED.as_bytes(), group_reward_distributor.id.as_ref(), &[group_reward_distributor.bump]];
    let group_reward_distributor_signer = &[&group_reward_distributor_seed[..]];

    let reward_amount = group_reward_distributor.reward_amount;
    let reward_duration_seconds = group_reward_distributor.reward_duration_seconds;

    let reward_seconds_received = group_reward_entry.reward_seconds_received;
    let end_time_stamp = group_entry.group_cooldown_start_seconds.unwrap_or(Clock::get().unwrap().unix_timestamp);
    let total_stake_seconds = (end_time_stamp - group_entry.changed_at) as u128;
    if reward_seconds_received <= total_stake_seconds
        && (group_reward_distributor.max_supply.is_none() || group_reward_distributor.rewards_issued < group_reward_distributor.max_supply.unwrap() as u128)
    {
        let mut reward_seconds = total_stake_seconds;
        if let Some(max_reward_seconds) = group_reward_distributor.max_reward_seconds_received {
            reward_seconds = min(reward_seconds, max_reward_seconds)
        };
        let mut reward_amount_to_receive = reward_seconds
            .checked_sub(reward_seconds_received)
            .unwrap()
            .checked_div(reward_duration_seconds)
            .unwrap()
            .checked_mul(reward_amount as u128)
            .unwrap()
            .checked_mul(
                (group_reward_entry.multiplier as u128)
                    .checked_mul(group_reward_distributor.base_multiplier as u128)
                    .unwrap()
                    .checked_div((10_u128).checked_pow(group_reward_distributor.base_multiplier_decimals as u32).unwrap())
                    .unwrap()
                    .checked_add(
                        (group_reward_distributor.base_adder as u128)
                            .checked_div((10_u128).checked_pow(group_reward_distributor.base_adder_decimals as u32).unwrap())
                            .unwrap(),
                    )
                    .unwrap(),
            )
            .unwrap()
            .checked_div((10_u128).checked_pow(group_reward_distributor.multiplier_decimals as u32).unwrap())
            .unwrap();

        if group_reward_distributor.group_count_multiplier.is_some() && group_reward_distributor.group_count_multiplier_decimals.is_some() {
            reward_amount_to_receive = reward_amount_to_receive
                .checked_mul(group_reward_counter.count as u128)
                .unwrap()
                .checked_mul(group_reward_distributor.group_count_multiplier.unwrap() as u128)
                .unwrap()
                .checked_div((10_u128).checked_pow(group_reward_distributor.group_count_multiplier_decimals.unwrap() as u32).unwrap())
                .unwrap()
        }

        // if this will go over max supply give rewards up to max supply
        if group_reward_distributor.max_supply.is_some()
            && group_reward_distributor.rewards_issued.checked_add(reward_amount_to_receive).unwrap() >= group_reward_distributor.max_supply.unwrap() as u128
        {
            reward_amount_to_receive = (group_reward_distributor.max_supply.unwrap() as u128).checked_sub(group_reward_distributor.rewards_issued).unwrap();
        }

        // mint to the user
        let remaining_accs = &mut ctx.remaining_accounts.iter();
        match group_reward_distributor.reward_kind {
            k if k == GroupRewardDistributorKind::Mint => {
                let cpi_accounts = token::MintTo {
                    mint: ctx.accounts.reward_mint.to_account_info(),
                    to: ctx.accounts.user_reward_mint_token_account.to_account_info(),
                    authority: group_reward_distributor.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(group_reward_distributor_signer);
                // todo this could be an issue and get stuck, might need 2 transfers
                token::mint_to(cpi_context, reward_amount_to_receive.try_into().expect("Too many rewards to receive"))?;
            }
            k if k == GroupRewardDistributorKind::Treasury => {
                let group_reward_distributor_token_account_info = next_account_info(remaining_accs)?;
                let group_reward_distributor_token_account = Account::<TokenAccount>::try_from(group_reward_distributor_token_account_info)?;

                if reward_amount_to_receive > group_reward_distributor_token_account.amount as u128 {
                    reward_amount_to_receive = group_reward_distributor_token_account.amount as u128;
                }

                let cpi_accounts = token::Transfer {
                    from: group_reward_distributor_token_account.to_account_info(),
                    to: ctx.accounts.user_reward_mint_token_account.to_account_info(),
                    authority: group_reward_distributor.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(group_reward_distributor_signer);
                // todo this could be an issue and get stuck, might need 2 transfers
                token::transfer(cpi_context, reward_amount_to_receive.try_into().expect("Too many rewards to receive"))?;
            }
            _ => return Err(error!(ErrorCode::InvalidRewardDistributorKind)),
        }
        // update values
        // this is nuanced about if the rewards are closed, should they get the reward time for that time even though they didnt get any rewards?
        // this only matters if the reward distributor becomes open again and they missed out on some rewards they coudlve gotten
        let mut reward_time_to_receive = reward_amount_to_receive;
        if group_reward_distributor.group_count_multiplier.is_some()
            && group_reward_distributor.group_count_multiplier_decimals.is_some()
            && group_reward_distributor.group_count_multiplier.unwrap() != 0
        {
            reward_time_to_receive = reward_time_to_receive
                .checked_mul((10_u128).checked_pow(group_reward_distributor.group_count_multiplier_decimals.unwrap() as u32).unwrap())
                .unwrap()
                .checked_div(group_reward_distributor.group_count_multiplier.unwrap() as u128)
                .unwrap()
                .checked_div(group_reward_counter.count as u128)
                .unwrap();
        }
        if group_reward_entry.multiplier != 0 && group_reward_distributor.base_multiplier != 0 {
            reward_time_to_receive = reward_time_to_receive
                .checked_mul((10_u128).checked_pow(group_reward_distributor.multiplier_decimals as u32).unwrap())
                .unwrap()
                .checked_div(
                    (group_reward_entry.multiplier as u128)
                        .checked_mul(group_reward_distributor.base_multiplier as u128)
                        .unwrap()
                        .checked_div((10_u128).checked_pow(group_reward_distributor.base_multiplier_decimals as u32).unwrap())
                        .unwrap()
                        .checked_add(
                            (group_reward_distributor.base_adder as u128)
                                .checked_div((10_u128).checked_pow(group_reward_distributor.base_adder_decimals as u32).unwrap())
                                .unwrap(),
                        )
                        .unwrap(),
                )
                .unwrap()
                .checked_div(reward_amount as u128)
                .unwrap()
                .checked_mul(reward_duration_seconds)
                .unwrap()
        } else {
            reward_time_to_receive = 0_u128
        }

        group_reward_distributor.rewards_issued = group_reward_distributor.rewards_issued.checked_add(reward_amount_to_receive).unwrap();
        group_reward_entry.reward_seconds_received = group_reward_entry.reward_seconds_received.checked_add(reward_time_to_receive).unwrap();

        /*
        invoke(
            &transfer(&ctx.accounts.authority.to_account_info().key(), &ctx.accounts.reward_manager.key(), CLAIM_REWARD_LAMPORTS),
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.reward_manager.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        */
    }

    Ok(())
}
