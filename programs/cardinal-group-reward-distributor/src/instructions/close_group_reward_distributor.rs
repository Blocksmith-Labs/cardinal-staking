use crate::errors::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::AccountsClose;
use anchor_spl::token::Mint;
use anchor_spl::token::SetAuthority;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::{self};
use spl_token::instruction::AuthorityType;

#[derive(Accounts)]
pub struct CloseGroupRewardDistributerCtx<'info> {
    #[account(mut, has_one = authority)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    #[account(mut)]
    reward_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    authority: Signer<'info>,

    token_program: Program<'info, Token>,
}

pub fn handler<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, CloseGroupRewardDistributerCtx<'info>>) -> Result<()> {
    let group_reward_distributor = &mut ctx.accounts.group_reward_distributor;
    let group_reward_distributor_seed = &[GROUP_REWARD_DISTRIBUTOR_SEED.as_bytes(), group_reward_distributor.id.as_ref(), &[group_reward_distributor.bump]];
    let group_reward_distributor_signer = &[&group_reward_distributor_seed[..]];

    let remaining_accs = &mut ctx.remaining_accounts.iter();
    match group_reward_distributor.reward_kind {
        k if k == GroupRewardDistributorKind::Mint => {
            let cpi_accounts = SetAuthority {
                account_or_mint: ctx.accounts.reward_mint.to_account_info(),
                current_authority: group_reward_distributor.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(group_reward_distributor_signer);
            token::set_authority(cpi_context, AuthorityType::MintTokens, Some(ctx.accounts.reward_mint.key()))?;
        }
        k if k == GroupRewardDistributorKind::Treasury => {
            let group_reward_distributor_token_account_info = next_account_info(remaining_accs)?;
            let group_reward_distributor_token_account = Account::<TokenAccount>::try_from(group_reward_distributor_token_account_info)?;
            let authority_token_account_info = next_account_info(remaining_accs)?;
            let authority_token_account = Account::<TokenAccount>::try_from(authority_token_account_info)?;

            let cpi_accounts = token::Transfer {
                from: group_reward_distributor_token_account.to_account_info(),
                to: authority_token_account.to_account_info(),
                authority: group_reward_distributor.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(group_reward_distributor_signer);
            token::transfer(cpi_context, group_reward_distributor_token_account.amount)?;

            let cpi_accounts = token::CloseAccount {
                account: group_reward_distributor_token_account.to_account_info(),
                destination: authority_token_account.to_account_info(),
                authority: group_reward_distributor.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(group_reward_distributor_signer);
            token::close_account(cpi_context)?;
        }
        _ => return Err(error!(ErrorCode::InvalidRewardDistributorKind)),
    }

    ctx.accounts.group_reward_distributor.close(ctx.accounts.authority.to_account_info())?;
    Ok(())
}
