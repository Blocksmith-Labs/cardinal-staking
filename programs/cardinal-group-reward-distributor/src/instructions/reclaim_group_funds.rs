use crate::errors::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::{self};

#[derive(Accounts)]
pub struct ReclaimGroupFundsCtx<'info> {
    #[account(mut)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    #[account(mut, constraint = group_reward_distributor_token_account.owner == group_reward_distributor.key() && group_reward_distributor_token_account.mint == group_reward_distributor.reward_mint @ ErrorCode::InvalidRewardDistributorTokenAccount)]
    group_reward_distributor_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = authority_token_account.owner == authority.key() && authority_token_account.mint == group_reward_distributor.reward_mint @ ErrorCode::InvalidAuthorityTokenAccount)]
    authority_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = authority.key() == group_reward_distributor.authority @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,

    token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ReclaimGroupFundsCtx>, amount: u64) -> Result<()> {
    let group_reward_distributor_seed = &[
        GROUP_REWARD_DISTRIBUTOR_SEED.as_bytes(),
        ctx.accounts.group_reward_distributor.id.as_ref(),
        &[ctx.accounts.group_reward_distributor.bump],
    ];
    let group_reward_distributor_signer = &[&group_reward_distributor_seed[..]];
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.group_reward_distributor_token_account.to_account_info(),
        to: ctx.accounts.authority_token_account.to_account_info(),
        authority: ctx.accounts.group_reward_distributor.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(group_reward_distributor_signer);
    token::transfer(cpi_context, amount)?;
    Ok(())
}
