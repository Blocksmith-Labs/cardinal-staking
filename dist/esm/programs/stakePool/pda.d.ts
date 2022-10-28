import { BN } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
/**
 * Finds the stake pool id.
 * @returns
 */
export declare const findStakePoolId: (identifier: BN) => Promise<[web3.PublicKey, number]>;
/**
 * Convenience method to find the stake entry id.
 * @returns
 */
export declare const findStakeEntryId: (wallet: web3.PublicKey, stakePoolId: web3.PublicKey, originalMintId: web3.PublicKey, isFungible: boolean) => Promise<[web3.PublicKey, number]>;
/**
 * Finds the identifier id.
 * @returns
 */
export declare const findIdentifierId: () => Promise<[web3.PublicKey, number]>;
/**
 * Find stake authorization id.
 * @returns
 */
export declare const findStakeAuthorizationId: (stakePoolId: web3.PublicKey, mintId: web3.PublicKey) => Promise<[web3.PublicKey, number]>;
/**
 * Find stake booster id.
 * @returns
 */
export declare const findStakeBoosterId: (stakePoolId: web3.PublicKey, identifier?: BN) => Promise<[web3.PublicKey, number]>;
//# sourceMappingURL=pda.d.ts.map