use crate::errors::ErrorCode;
use crate::state::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::SetAuthority;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::{self};
use spl_token::instruction::AuthorityType;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitGroupRewardDistributorIx {
    pub id: Pubkey,
    pub reward_amount: u64,
    pub reward_duration_seconds: u128,
    pub reward_kind: u8,
    pub metadata_kind: u8,
    pub pool_kind: u8,
    pub authorized_pools: Vec<Pubkey>,
    pub authorized_creators: Option<Vec<Pubkey>>,
    pub supply: Option<u64>,
    pub base_adder: Option<u64>,
    pub base_adder_decimals: Option<u8>,
    pub base_multiplier: Option<u64>,
    pub base_multiplier_decimals: Option<u8>,
    pub multiplier_decimals: Option<u8>,
    pub max_supply: Option<u64>,
    pub min_cooldown_seconds: Option<u32>,
    pub min_stake_seconds: Option<u32>,
    pub group_count_multiplier: Option<u64>,
    pub group_count_multiplier_decimals: Option<u8>,
    pub min_group_size: Option<u8>,
    pub max_reward_seconds_received: Option<u128>,
}

#[derive(Accounts)]
#[instruction(ix: InitGroupRewardDistributorIx)]
pub struct InitGroupRewardDistributorCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = GROUP_REWARD_DISTRIBUTOR_SIZE,
        seeds = [GROUP_REWARD_DISTRIBUTOR_SEED.as_bytes(), ix.id.key().as_ref()],
        bump,
    )]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    #[account(mut)]
    reward_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    authority: Signer<'info>,

    #[account(mut)]
    payer: Signer<'info>,

    token_program: Program<'info, Token>,

    system_program: Program<'info, System>,
}

pub fn handler<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, InitGroupRewardDistributorCtx<'info>>, ix: InitGroupRewardDistributorIx) -> Result<()> {
    let group_reward_distributor = &mut ctx.accounts.group_reward_distributor;
    group_reward_distributor.bump = *ctx.bumps.get("group_reward_distributor").unwrap();
    group_reward_distributor.id = ix.id;
    group_reward_distributor.reward_kind = GroupRewardDistributorKind::from(ix.reward_kind);
    group_reward_distributor.metadata_kind = GroupRewardDistributorMetadataKind::from(ix.metadata_kind);
    group_reward_distributor.pool_kind = GroupRewardDistributorPoolKind::from(ix.pool_kind);
    group_reward_distributor.authorized_pools = ix.authorized_pools;
    group_reward_distributor.authorized_creators = ix.authorized_creators;
    group_reward_distributor.authority = ctx.accounts.authority.key();
    group_reward_distributor.reward_mint = ctx.accounts.reward_mint.key();
    group_reward_distributor.reward_amount = ix.reward_amount;
    group_reward_distributor.reward_duration_seconds = ix.reward_duration_seconds as u128;
    group_reward_distributor.base_adder = ix.base_adder.unwrap_or(0);
    group_reward_distributor.base_adder_decimals = ix.base_adder_decimals.unwrap_or(0);
    group_reward_distributor.base_multiplier = ix.base_multiplier.unwrap_or(1);
    group_reward_distributor.base_multiplier_decimals = ix.base_multiplier_decimals.unwrap_or(0);
    group_reward_distributor.multiplier_decimals = ix.multiplier_decimals.unwrap_or(0);
    group_reward_distributor.min_cooldown_seconds = ix.min_cooldown_seconds.unwrap_or(0);
    group_reward_distributor.min_stake_seconds = ix.min_stake_seconds.unwrap_or(0);
    group_reward_distributor.max_supply = ix.max_supply;
    group_reward_distributor.group_count_multiplier = ix.group_count_multiplier;
    group_reward_distributor.group_count_multiplier_decimals = ix.group_count_multiplier_decimals;
    group_reward_distributor.min_group_size = ix.min_group_size;
    group_reward_distributor.max_reward_seconds_received = ix.max_reward_seconds_received;

    let remaining_accs = &mut ctx.remaining_accounts.iter();
    match ix.reward_kind {
        k if k == GroupRewardDistributorKind::Mint as u8 => {
            let cpi_accounts = SetAuthority {
                account_or_mint: ctx.accounts.reward_mint.to_account_info(),
                current_authority: ctx.accounts.authority.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
            token::set_authority(cpi_context, AuthorityType::MintTokens, Some(group_reward_distributor.key()))?;
        }
        k if k == GroupRewardDistributorKind::Treasury as u8 => {
            if ix.supply.is_none() && ix.max_supply.is_none() {
                return Err(error!(ErrorCode::SupplyRequired));
            }
            let group_reward_distributor_token_account_info = next_account_info(remaining_accs)?;
            let group_reward_distributor_token_account = Account::<TokenAccount>::try_from(group_reward_distributor_token_account_info)?;
            let authority_token_account_info = next_account_info(remaining_accs)?;
            let authority_token_account = Account::<TokenAccount>::try_from(authority_token_account_info)?;

            if authority_token_account.mint != ctx.accounts.reward_mint.key() {
                return Err(error!(ErrorCode::InvalidAuthorityTokenAccount));
            }

            if group_reward_distributor_token_account.mint != ctx.accounts.reward_mint.key() || group_reward_distributor_token_account.owner.key() != group_reward_distributor.key() {
                return Err(error!(ErrorCode::InvalidRewardDistributorTokenAccount));
            }

            let cpi_accounts = token::Transfer {
                from: authority_token_account.to_account_info(),
                to: group_reward_distributor_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_context, ix.supply.unwrap_or_else(|| ix.max_supply.unwrap()))?;
        }
        _ => return Err(error!(ErrorCode::InvalidRewardDistributorKind)),
    }

    let new_space = group_reward_distributor.try_to_vec()?.len() + 8;
    resize_account(
        &group_reward_distributor.to_account_info(),
        new_space,
        &ctx.accounts.authority.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
    )?;

    Ok(())
}
