"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptType = exports.STAKE_BOOSTER_PAYMENT_MANAGER = exports.STAKE_BOOSTER_PAYMENT_MANAGER_NAME = exports.STAKE_POOL_IDL = exports.POOL_OFFSET = exports.STAKER_OFFSET = exports.AUTHORITY_OFFSET = exports.STAKE_BOOSTER_SEED = exports.STAKE_AUTHORIZATION_SEED = exports.IDENTIFIER_SEED = exports.STAKE_ENTRY_SEED = exports.STAKE_POOL_SEED = exports.STAKE_POOL_ADDRESS = void 0;
const tslib_1 = require("tslib");
const web3_js_1 = require("@solana/web3.js");
const STAKE_POOL_TYPES = tslib_1.__importStar(require("../../idl/cardinal_stake_pool"));
exports.STAKE_POOL_ADDRESS = new web3_js_1.PublicKey("47Eamqe6bTbrqSwZwPFTYCQSPxx92E9zw8XTPDz2yHSp");
exports.STAKE_POOL_SEED = "stake-pool";
exports.STAKE_ENTRY_SEED = "stake-entry";
exports.IDENTIFIER_SEED = "identifier";
exports.STAKE_AUTHORIZATION_SEED = "stake-authorization";
exports.STAKE_BOOSTER_SEED = "stake-booster";
exports.AUTHORITY_OFFSET = 25;
exports.STAKER_OFFSET = 82;
exports.POOL_OFFSET = 9;
exports.STAKE_POOL_IDL = STAKE_POOL_TYPES.IDL;
exports.STAKE_BOOSTER_PAYMENT_MANAGER_NAME = "cardinal-stake-booster";
exports.STAKE_BOOSTER_PAYMENT_MANAGER = new web3_js_1.PublicKey("CuEDMUqgkGTVcAaqEDHuVR848XN38MPsD11JrkxcGD6a" // cardinal-stake-booster
);
var ReceiptType;
(function (ReceiptType) {
    // Receive the original mint wrapped in a token manager
    ReceiptType[ReceiptType["Original"] = 1] = "Original";
    // Receive a receipt mint wrapped in a token manager
    ReceiptType[ReceiptType["Receipt"] = 2] = "Receipt";
    // Receive nothing
    ReceiptType[ReceiptType["None"] = 3] = "None";
})(ReceiptType = exports.ReceiptType || (exports.ReceiptType = {}));
//# sourceMappingURL=constants.js.map