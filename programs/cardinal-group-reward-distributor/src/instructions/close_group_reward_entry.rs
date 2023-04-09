use crate::state::*;
use anchor_lang::prelude::*;
use cardinal_stake_pool::state::GroupStakeEntry;

#[derive(Accounts)]
pub struct CloseGroupRewardEntryCtx<'info> {
    #[account(mut, close = authority, has_one = group_entry, has_one = group_reward_distributor)]
    group_reward_entry: Box<Account<'info, GroupRewardEntry>>,

    #[account(mut, has_one = authority, has_one = group_reward_distributor)]
    group_reward_counter: Box<Account<'info, GroupRewardCounter>>,

    #[account(mut)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    #[account(mut, has_one = authority)]
    group_entry: Box<Account<'info, GroupStakeEntry>>,

    #[account(mut)]
    authority: Signer<'info>,
}

pub fn handler(ctx: Context<CloseGroupRewardEntryCtx>) -> Result<()> {
    let group_reward_counter = &mut ctx.accounts.group_reward_counter;
    group_reward_counter.count -= 1;

    Ok(())
}
