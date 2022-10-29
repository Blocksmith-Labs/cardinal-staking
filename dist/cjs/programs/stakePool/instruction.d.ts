import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { AccountMeta, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TokenManagerKind, TokenManagerState } from "cardinal-token-manager/dist/cjs/programs/tokenManager";
import { ReceiptType } from "./constants";
export declare const initPoolIdentifier: (connection: Connection, wallet: Wallet, params: {
    identifierId: PublicKey;
}) => TransactionInstruction;
export declare const initStakePool: (connection: Connection, wallet: Wallet, params: {
    identifierId: PublicKey;
    stakePoolId: PublicKey;
    requiresCreators: PublicKey[];
    requiresCollections: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText: string;
    imageUri: string;
    authority: PublicKey;
    resetOnStake: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
}) => TransactionInstruction;
export declare const authorizeStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<TransactionInstruction>;
export declare const deauthorizeStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<TransactionInstruction>;
export declare const initStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    originalMintMetadatId: PublicKey;
}) => Promise<TransactionInstruction>;
export declare const initStakeMint: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    originalMintMetadatId: PublicKey;
    stakeEntryStakeMintTokenAccountId: PublicKey;
    stakeMintMetadataId: PublicKey;
    stakeMintId: PublicKey;
    mintManagerId: PublicKey;
    name: string;
    symbol: string;
}) => TransactionInstruction;
export declare const claimReceiptMint: (connection: Connection, wallet: Wallet, params: {
    stakeEntryId: PublicKey;
    tokenManagerReceiptMintTokenAccountId: PublicKey;
    originalMintId: PublicKey;
    receiptMintId: PublicKey;
    receiptType: ReceiptType;
}) => Promise<TransactionInstruction>;
export declare const stake: (connection: Connection, wallet: Wallet, params: {
    originalMint: PublicKey;
    stakeEntryId: PublicKey;
    stakePoolId: PublicKey;
    stakeEntryOriginalMintTokenAccountId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    amount: BN;
}) => TransactionInstruction;
export declare const unstake: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    stakeEntryOriginalMintTokenAccount: PublicKey;
    userOriginalMintTokenAccount: PublicKey;
    user: PublicKey;
    remainingAccounts: AccountMeta[];
}) => TransactionInstruction;
export declare const updateStakePool: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    requiresCreators: PublicKey[];
    requiresCollections: PublicKey[];
    requiresAuthorization: boolean;
    overlayText: string;
    imageUri: string;
    authority: PublicKey;
    resetOnStake: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
}) => TransactionInstruction;
export declare const updateTotalStakeSeconds: (connection: Connection, wallet: Wallet, params: {
    stakEntryId: PublicKey;
    lastStaker: PublicKey;
}) => TransactionInstruction;
export declare const returnReceiptMint: (connection: Connection, wallet: Wallet, params: {
    stakeEntry: PublicKey;
    receiptMint: PublicKey;
    tokenManagerKind: TokenManagerKind;
    tokenManagerState: TokenManagerState;
    returnAccounts: AccountMeta[];
}) => Promise<TransactionInstruction>;
export declare const closeStakePool: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    authority: PublicKey;
}) => TransactionInstruction;
export declare const closeStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    authority: PublicKey;
}) => TransactionInstruction;
export declare const reassignStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    target: PublicKey;
}) => TransactionInstruction;
export declare const initStakeBooster: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
    payer?: PublicKey;
}) => Promise<TransactionInstruction>;
export declare const updateStakeBooster: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
}) => Promise<TransactionInstruction>;
export declare const closeStakeBooster: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
}) => Promise<TransactionInstruction>;
//# sourceMappingURL=instruction.d.ts.map