use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitGroupRewardCounterCtx<'info> {
    #[account(
        init,
        payer = authority,
        space = GROUP_REWARD_COUNTER_SIZE,
        seeds = [GROUP_REWARD_COUNTER_SEED.as_bytes(), group_reward_distributor.key().as_ref(), authority.key().as_ref()],
        bump,
    )]
    group_reward_counter: Box<Account<'info, GroupRewardCounter>>,

    #[account(mut)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    #[account(mut)]
    authority: Signer<'info>,

    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitGroupRewardCounterCtx>) -> Result<()> {
    let group_reward_counter = &mut ctx.accounts.group_reward_counter;
    group_reward_counter.bump = *ctx.bumps.get("group_reward_counter").unwrap();
    group_reward_counter.group_reward_distributor = ctx.accounts.group_reward_distributor.key();
    group_reward_counter.authority = ctx.accounts.authority.key();
    group_reward_counter.count = 0;

    Ok(())
}
