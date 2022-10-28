import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { AccountMeta, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { RewardDistributorKind } from "./constants";
export declare const initRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    rewardDistributorId: PublicKey;
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    kind: RewardDistributorKind;
    remainingAccountsForKind: AccountMeta[];
    maxSupply?: BN;
    supply?: BN;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
    maxRewardSecondsReceived?: BN;
}) => TransactionInstruction;
export declare const initRewardEntry: (connection: Connection, wallet: Wallet, params: {
    stakeEntryId: PublicKey;
    rewardDistributor: PublicKey;
    rewardEntryId: PublicKey;
    payer?: PublicKey;
}) => TransactionInstruction;
export declare const claimRewards: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    rewardMintId: PublicKey;
    rewardMintTokenAccountId: PublicKey;
    remainingAccountsForKind: AccountMeta[];
    payer?: PublicKey;
}) => Promise<TransactionInstruction>;
export declare const closeRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    remainingAccountsForKind: AccountMeta[];
}) => Promise<TransactionInstruction>;
export declare const updateRewardEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    multiplier: BN;
}) => Promise<TransactionInstruction>;
export declare const closeRewardEntry: (connection: Connection, wallet: Wallet, params: {
    rewardDistributorId: PublicKey;
    rewardEntryId: PublicKey;
}) => TransactionInstruction;
export declare const updateRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    rewardDistributorId: PublicKey;
    defaultMultiplier: BN;
    multiplierDecimals: number;
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    maxRewardSecondsReceived?: BN;
}) => TransactionInstruction;
export declare const reclaimFunds: (connection: Connection, wallet: Wallet, params: {
    rewardDistributorId: PublicKey;
    rewardDistributorTokenAccountId: PublicKey;
    authorityTokenAccountId: PublicKey;
    authority: PublicKey;
    amount: BN;
}) => TransactionInstruction;
//# sourceMappingURL=instruction.d.ts.map