use crate::state::*;
use crate::utils::*;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateGroupRewardDistributorIx {
    pub reward_amount: u64,
    pub reward_duration_seconds: u128,
    pub metadata_kind: u8,
    pub pool_kind: u8,
    pub authorized_pools: Vec<Pubkey>,
    pub authorized_creators: Option<Vec<Pubkey>>,
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
#[instruction(ix: UpdateGroupRewardDistributorIx)]
pub struct UpdateGroupRewardDistributorCtx<'info> {
    #[account(mut, has_one = authority)]
    group_reward_distributor: Box<Account<'info, GroupRewardDistributor>>,

    authority: Signer<'info>,

    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateGroupRewardDistributorCtx>, ix: UpdateGroupRewardDistributorIx) -> Result<()> {
    let group_reward_distributor = &mut ctx.accounts.group_reward_distributor;
    group_reward_distributor.metadata_kind = GroupRewardDistributorMetadataKind::from(ix.metadata_kind);
    group_reward_distributor.pool_kind = GroupRewardDistributorPoolKind::from(ix.pool_kind);
    group_reward_distributor.authorized_pools = ix.authorized_pools;
    group_reward_distributor.authorized_creators = ix.authorized_creators;
    group_reward_distributor.reward_amount = ix.reward_amount;
    group_reward_distributor.reward_duration_seconds = ix.reward_duration_seconds as u128;
    group_reward_distributor.max_supply = ix.max_supply;
    group_reward_distributor.base_adder = ix.base_adder.unwrap_or(0);
    group_reward_distributor.base_adder_decimals = ix.base_adder_decimals.unwrap_or(0);
    group_reward_distributor.base_multiplier = ix.base_multiplier.unwrap_or(1);
    group_reward_distributor.base_multiplier_decimals = ix.base_multiplier_decimals.unwrap_or(0);
    group_reward_distributor.multiplier_decimals = ix.multiplier_decimals.unwrap_or(0);
    group_reward_distributor.min_cooldown_seconds = ix.min_cooldown_seconds.unwrap_or(0);
    group_reward_distributor.min_stake_seconds = ix.min_stake_seconds.unwrap_or(0);
    group_reward_distributor.group_count_multiplier = ix.group_count_multiplier;
    group_reward_distributor.group_count_multiplier_decimals = ix.group_count_multiplier_decimals;
    group_reward_distributor.min_group_size = ix.min_group_size;
    group_reward_distributor.max_reward_seconds_received = ix.max_reward_seconds_received;

    let new_space = group_reward_distributor.try_to_vec()?.len() + 8;
    resize_account(
        &group_reward_distributor.to_account_info(),
        new_space,
        &ctx.accounts.authority.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
    )?;

    Ok(())
}
