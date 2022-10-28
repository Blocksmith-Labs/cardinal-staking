import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type * as web3 from "@solana/web3.js";
export declare const remainingAccountsForInitStakeEntry: (stakePoolId: web3.PublicKey, originalMintId: web3.PublicKey) => Promise<web3.AccountMeta[]>;
export declare const withRemainingAccountsForUnstake: (transaction: web3.Transaction, connection: web3.Connection, wallet: Wallet, stakeEntryId: web3.PublicKey, receiptMint: web3.PublicKey | null | undefined) => Promise<web3.AccountMeta[]>;
/**
 * Convenience method to find the stake entry id from a mint
 * NOTE: This will lookup the mint on-chain to get the supply
 * @returns
 */
export declare const findStakeEntryIdFromMint: (connection: web3.Connection, wallet: web3.PublicKey, stakePoolId: web3.PublicKey, originalMintId: web3.PublicKey, isFungible?: boolean) => Promise<[web3.PublicKey, number]>;
export declare const getTotalStakeSeconds: (connection: web3.Connection, stakeEntryId: web3.PublicKey) => Promise<BN>;
export declare const getActiveStakeSeconds: (connection: web3.Connection, stakeEntryId: web3.PublicKey) => Promise<BN>;
export declare const getUnclaimedRewards: (connection: web3.Connection, stakePoolId: web3.PublicKey) => Promise<BN>;
export declare const getClaimedRewards: (connection: web3.Connection, stakePoolId: web3.PublicKey) => Promise<BN>;
//# sourceMappingURL=utils.d.ts.map