import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type * as web3 from "@solana/web3.js";
import { ReceiptType } from "./constants";
/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
export declare const withInitPoolIdentifier: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet) => Promise<[web3.Transaction, web3.PublicKey]>;
export declare const withInitStakePool: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    requiresCollections?: web3.PublicKey[];
    requiresCreators?: web3.PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
}) => Promise<[web3.Transaction, web3.PublicKey]>;
/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
export declare const withInitStakeEntry: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
}) => Promise<[web3.Transaction, web3.PublicKey]>;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withAuthorizeStakeEntry: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
}) => Promise<web3.Transaction>;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withDeauthorizeStakeEntry: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
}) => Promise<web3.Transaction>;
/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
export declare const withInitStakeMint: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    stakeMintKeypair: web3.Keypair;
    name: string;
    symbol: string;
}) => Promise<[web3.Transaction, web3.Keypair]>;
/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withClaimReceiptMint: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    receiptMintId: web3.PublicKey;
    receiptType: ReceiptType;
}) => Promise<web3.Transaction>;
/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withStake: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    userOriginalMintTokenAccountId: web3.PublicKey;
    amount?: BN;
}) => Promise<web3.Transaction>;
/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withUnstake: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    skipRewardMintTokenAccount?: boolean;
}) => Promise<web3.Transaction>;
export declare const withUpdateStakePool: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    requiresCollections?: web3.PublicKey[];
    requiresCreators?: web3.PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
}) => [web3.Transaction, web3.PublicKey];
export declare const withUpdateTotalStakeSeconds: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakeEntryId: web3.PublicKey;
    lastStaker: web3.PublicKey;
}) => web3.Transaction;
export declare const withReturnReceiptMint: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakeEntryId: web3.PublicKey;
}) => Promise<web3.Transaction>;
export declare const withCloseStakePool: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
}) => web3.Transaction;
export declare const withCloseStakeEntry: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
}) => web3.Transaction;
export declare const withReassignStakeEntry: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    target: web3.PublicKey;
}) => web3.Transaction;
export declare const withInitStakeBooster: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: web3.PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
    payer?: web3.PublicKey;
}) => Promise<web3.Transaction>;
export declare const withUpdateStakeBooster: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: web3.PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
}) => Promise<web3.Transaction>;
export declare const withCloseStakeBooster: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, params: {
    stakePoolId: web3.PublicKey;
    stakeBoosterIdentifier?: BN;
}) => Promise<web3.Transaction>;
//# sourceMappingURL=transaction.d.ts.map