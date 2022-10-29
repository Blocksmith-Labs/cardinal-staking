import { PublicKey } from "@solana/web3.js";
import * as STAKE_POOL_TYPES from "../../idl/cardinal_stake_pool";
export const STAKE_POOL_ADDRESS = new PublicKey(
  "GKh7n1S96Kj3jadaqtALZu8i3oMnKkLHDXXKU6fweWX2"
);
export const STAKE_POOL_SEED = "stake-pool";
export const STAKE_ENTRY_SEED = "stake-entry";
export const IDENTIFIER_SEED = "identifier";
export const STAKE_AUTHORIZATION_SEED = "stake-authorization";
export const STAKE_BOOSTER_SEED = "stake-booster";
export const AUTHORITY_OFFSET = 25;
export const STAKER_OFFSET = 82;
export const POOL_OFFSET = 9;
export const STAKE_POOL_IDL = STAKE_POOL_TYPES.IDL;
export const STAKE_BOOSTER_PAYMENT_MANAGER_NAME = "cardinal-stake-booster";
export const STAKE_BOOSTER_PAYMENT_MANAGER = new PublicKey(
  "CuEDMUqgkGTVcAaqEDHuVR848XN38MPsD11JrkxcGD6a" // cardinal-stake-booster
);
export var ReceiptType;
(function (ReceiptType) {
  // Receive the original mint wrapped in a token manager
  ReceiptType[(ReceiptType["Original"] = 1)] = "Original";
  // Receive a receipt mint wrapped in a token manager
  ReceiptType[(ReceiptType["Receipt"] = 2)] = "Receipt";
  // Receive nothing
  ReceiptType[(ReceiptType["None"] = 3)] = "None";
})(ReceiptType || (ReceiptType = {}));
//# sourceMappingURL=constants.js.map
