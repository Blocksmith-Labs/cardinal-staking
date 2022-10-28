"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardDistributorKind =
  exports.REWARD_DISTRIBUTOR_IDL =
  exports.REWARD_DISTRIBUTOR_SEED =
  exports.REWARD_ENTRY_SEED =
  exports.REWARD_MANAGER =
  exports.REWARD_DISTRIBUTOR_ADDRESS =
    void 0;
const tslib_1 = require("tslib");
const web3_js_1 = require("@solana/web3.js");
const REWARD_DISTRIBUTOR_TYPES = tslib_1.__importStar(
  require("../../idl/cardinal_reward_distributor")
);
exports.REWARD_DISTRIBUTOR_ADDRESS = new web3_js_1.PublicKey(
  "6566pw1vumw5aw7FKX2iFydBzAF1ubuzPcGxH4vUD5XN"
);
exports.REWARD_MANAGER = new web3_js_1.PublicKey(
  "crkdpVWjHWdggGgBuSyAqSmZUmAjYLzD435tcLDRLXr"
);
exports.REWARD_ENTRY_SEED = "reward-entry";
exports.REWARD_DISTRIBUTOR_SEED = "reward-distributor";
exports.REWARD_DISTRIBUTOR_IDL = REWARD_DISTRIBUTOR_TYPES.IDL;
var RewardDistributorKind;
(function (RewardDistributorKind) {
  RewardDistributorKind[(RewardDistributorKind["Mint"] = 1)] = "Mint";
  RewardDistributorKind[(RewardDistributorKind["Treasury"] = 2)] = "Treasury";
})(
  (RewardDistributorKind =
    exports.RewardDistributorKind || (exports.RewardDistributorKind = {}))
);
//# sourceMappingURL=constants.js.map