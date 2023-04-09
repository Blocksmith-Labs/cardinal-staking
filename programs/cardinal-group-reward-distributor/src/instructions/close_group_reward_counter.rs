use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseGroupRewardCounterCtx<'info> {
    #[account(mut, close = authority, has_one = group_reward_distributor, constraint = group_reward_counter.count == 0)]
    group_reward_counter: Box<Account<'info, GroupRewardCounter>>,

    #[account(mut, has_one = authority)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    #[account(mut)]
    authority: Signer<'info>,
}

pub fn handler(_ctx: Context<CloseGroupRewardCounterCtx>) -> Result<()> {
    Ok(())
}
