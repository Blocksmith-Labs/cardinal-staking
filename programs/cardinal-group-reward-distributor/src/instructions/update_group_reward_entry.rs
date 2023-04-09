use crate::state::*;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateGroupRewardEntryIx {
    pub multiplier: u64,
}

#[derive(Accounts)]
#[instruction(ix: UpdateGroupRewardEntryIx)]
pub struct UpdateGroupRewardEntryCtx<'info> {
    #[account(mut, has_one = group_reward_distributor)]
    group_reward_entry: Box<Account<'info, GroupRewardEntry>>,

    #[account(has_one = authority)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateGroupRewardEntryCtx>, ix: UpdateGroupRewardEntryIx) -> Result<()> {
    let group_reward_entry = &mut ctx.accounts.group_reward_entry;
    group_reward_entry.multiplier = ix.multiplier;
    Ok(())
}
