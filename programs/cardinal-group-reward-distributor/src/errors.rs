use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid reward mint")]
    InvalidRewardMint,
    #[msg("Invalid user reward mint token account")]
    InvalidUserRewardMintTokenAccount,
    #[msg("Invalid reward distributor")]
    InvalidRewardDistributor,
    #[msg("Invalid reward distributor kind")]
    InvalidRewardDistributorKind,
    #[msg("Initial supply required for kind treasury")]
    SupplyRequired,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Invalid stake entry")]
    InvalidStakeEntry,
    #[msg("Invalid reward distributor token account")]
    InvalidRewardDistributorTokenAccount,
    #[msg("Invalid authority token account")]
    InvalidAuthorityTokenAccount,
    #[msg("Invalid group size")]
    InvalidGroupSize,
    #[msg("Invalid pool")]
    InvalidPool,
    #[msg("Original mint is invalid")]
    InvalidOriginalMint,
    #[msg("Invalid mint metadata")]
    InvalidMintMetadata,
    #[msg("Mint metadata is owned by the incorrect program")]
    InvalidMintMetadataOwner,
    #[msg("Invalid reward entry")]
    InvalidRewardEntry,
    #[msg("Invalid group seconds")]
    InvalidGroupSeconds,
    #[msg("Invalid cooldown seconds")]
    InvalidCooldownSeconds,
}
