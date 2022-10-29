import { PublicKey } from "@solana/web3.js";
import * as REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_reward_distributor";
export const REWARD_DISTRIBUTOR_ADDRESS = new PublicKey(
  "6566pw1vumw5aw7FKX2iFydBzAF1ubuzPcGxH4vUD5XN"
);
export const REWARD_MANAGER = new PublicKey(
  "crkdpVWjHWdggGgBuSyAqSmZUmAjYLzD435tcLDRLXr"
);
export const REWARD_ENTRY_SEED = "reward-entry";
export const REWARD_DISTRIBUTOR_SEED = "reward-distributor";
export const REWARD_DISTRIBUTOR_IDL = REWARD_DISTRIBUTOR_TYPES.IDL;
export var RewardDistributorKind;
(function (RewardDistributorKind) {
  RewardDistributorKind[(RewardDistributorKind["Mint"] = 1)] = "Mint";
  RewardDistributorKind[(RewardDistributorKind["Treasury"] = 2)] = "Treasury";
})(RewardDistributorKind || (RewardDistributorKind = {}));
//# sourceMappingURL=constants.js.map
