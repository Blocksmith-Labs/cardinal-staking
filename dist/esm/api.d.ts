import { BN } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import type { Connection, PublicKey, Signer } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";
import type { RewardDistributorKind } from "./programs/rewardDistributor";
import { ReceiptType } from "./programs/stakePool";
/**
 * Convenience call to create a stake pool
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param requiresCollections - (Optional) List of required collections pubkeys
 * @param requiresCreators - (Optional) List of required creators pubkeys
 * @param requiresAuthorization - (Optional) Boolean to require authorization
 * @param overlayText - (Optional) Text to overlay on receipt mint tokens
 * @param imageUri - (Optional) Image URI for stake pool
 * @param resetOnStake - (Optional) Boolean to reset an entry's total stake seconds on unstake
 * @param cooldownSeconds - (Optional) Number of seconds for token to cool down before returned to the staker
 * @param rewardDistributor - (Optional) Parameters to creat reward distributor
 * @returns
 */
export declare const createStakePool: (connection: Connection, wallet: Wallet, params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
    doubleOrResetEnabled?: boolean;
    rewardDistributor?: {
        rewardMintId: PublicKey;
        rewardAmount?: BN;
        rewardDurationSeconds?: BN;
        rewardDistributorKind?: RewardDistributorKind;
        maxSupply?: BN;
        supply?: BN;
    };
}) => Promise<[Transaction, PublicKey, PublicKey?]>;
/**
 * Convenience call to create a reward distributor
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param rewardMintId - (Optional) Reward mint id
 * @param rewardAmount - (Optional) Reward amount
 * @param rewardDurationSeconds - (Optional) Reward duration in seconds
 * @param rewardDistributorKind - (Optional) Reward distributor kind Mint or Treasury
 * @param maxSupply - (Optional) Max supply
 * @param supply - (Optional) Supply
 * @returns
 */
export declare const createRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    kind?: RewardDistributorKind;
    maxSupply?: BN;
    supply?: BN;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @returns
 */
export declare const createStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export declare const initializeRewardEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    multiplier?: BN;
}) => Promise<Transaction>;
/**
 * Convenience call to authorize a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export declare const authorizeStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<Transaction>;
/**
 * Convenience call to create a stake entry and a stake mint
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export declare const createStakeEntryAndStakeMint: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    receiptName?: string;
}) => Promise<[Transaction, PublicKey, Keypair | undefined]>;
/**
 * Convenience method to claim rewards
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param stakeEntryId - Original mint id
 * @returns
 */
export declare const claimRewards: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryIds: PublicKey[];
    lastStaker?: PublicKey;
    payer?: PublicKey;
}) => Promise<Transaction[]>;
export declare const claimRewardsAll: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryIds: PublicKey[];
    lastStaker?: PublicKey;
    payer?: PublicKey;
}) => Promise<{
    tx: Transaction;
}[][]>;
export declare const stake: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    amount?: BN;
    fungible?: boolean;
    receiptType?: ReceiptType;
}) => Promise<Transaction>;
/**
 * Convenience method to stake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param originalMintId - Original mint id
 * @param userOriginalMintTokenAccountId - User's original mint token account id
 * @param receiptType - (Optional) ReceiptType to be received back. If none provided, none will be claimed
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export declare const stakeAll: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    mintInfos: {
        mintId: PublicKey;
        tokenAccountId: PublicKey;
        fungible?: boolean;
        amount?: BN;
        receiptType?: ReceiptType;
    }[];
}) => Promise<{
    tx: Transaction;
    signers?: Signer[];
}[][]>;
export declare const unstake: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    fungible?: boolean;
    stakeEntryId?: PublicKey;
}) => Promise<Transaction>;
/**
 * Convenience method to unstake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export declare const unstakeAll: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    mintInfos: {
        mintId: PublicKey;
        stakeEntryId?: PublicKey;
        fungible?: boolean;
    }[];
}) => Promise<{
    tx: Transaction;
    signers?: Signer[];
}[][]>;
//# sourceMappingURL=api.d.ts.map