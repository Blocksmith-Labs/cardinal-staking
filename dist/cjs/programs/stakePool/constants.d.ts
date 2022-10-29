import type { AnchorTypes } from "@saberhq/anchor-contrib";
import { PublicKey } from "@solana/web3.js";
import * as STAKE_POOL_TYPES from "../../idl/cardinal_stake_pool";
export declare const STAKE_POOL_ADDRESS: PublicKey;
export declare const STAKE_POOL_SEED = "stake-pool";
export declare const STAKE_ENTRY_SEED = "stake-entry";
export declare const IDENTIFIER_SEED = "identifier";
export declare const STAKE_AUTHORIZATION_SEED = "stake-authorization";
export declare const STAKE_BOOSTER_SEED = "stake-booster";
export declare const AUTHORITY_OFFSET = 25;
export declare const STAKER_OFFSET = 82;
export declare const POOL_OFFSET = 9;
export declare type STAKE_POOL_PROGRAM = STAKE_POOL_TYPES.CardinalStakePool;
export declare const STAKE_POOL_IDL: STAKE_POOL_TYPES.CardinalStakePool;
export declare type StakePoolTypes = AnchorTypes<STAKE_POOL_PROGRAM>;
declare type Accounts = StakePoolTypes["Accounts"];
export declare type StakePoolData = Accounts["stakePool"];
export declare type StakeEntryData = Accounts["stakeEntry"];
export declare type IdentifierData = Accounts["identifier"];
export declare type StakeAuthorizationData = Accounts["stakeAuthorizationRecord"];
export declare type StakeBoosterData = Accounts["stakeBooster"];
export declare const STAKE_BOOSTER_PAYMENT_MANAGER_NAME = "cardinal-stake-booster";
export declare const STAKE_BOOSTER_PAYMENT_MANAGER: PublicKey;
export declare enum ReceiptType {
    Original = 1,
    Receipt = 2,
    None = 3
}
export {};
//# sourceMappingURL=constants.d.ts.map