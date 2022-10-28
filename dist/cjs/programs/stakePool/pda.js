"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStakeBoosterId =
  exports.findStakeAuthorizationId =
  exports.findIdentifierId =
  exports.findStakeEntryId =
  exports.findStakePoolId =
    void 0;
const tslib_1 = require("tslib");
const anchor_1 = require("@project-serum/anchor");
const web3 = tslib_1.__importStar(require("@solana/web3.js"));
const _1 = require(".");
const constants_1 = require("./constants");
/**
 * Finds the stake pool id.
 * @returns
 */
const findStakePoolId = async (identifier) => {
  return web3.PublicKey.findProgramAddress(
    [
      anchor_1.utils.bytes.utf8.encode(_1.STAKE_POOL_SEED),
      identifier.toArrayLike(Buffer, "le", 8),
    ],
    _1.STAKE_POOL_ADDRESS
  );
};
exports.findStakePoolId = findStakePoolId;
/**
 * Convenience method to find the stake entry id.
 * @returns
 */
const findStakeEntryId = async (
  wallet,
  stakePoolId,
  originalMintId,
  isFungible
) => {
  return web3.PublicKey.findProgramAddress(
    [
      anchor_1.utils.bytes.utf8.encode(_1.STAKE_ENTRY_SEED),
      stakePoolId.toBuffer(),
      originalMintId.toBuffer(),
      isFungible ? wallet.toBuffer() : web3.PublicKey.default.toBuffer(),
    ],
    _1.STAKE_POOL_ADDRESS
  );
};
exports.findStakeEntryId = findStakeEntryId;
/**
 * Finds the identifier id.
 * @returns
 */
const findIdentifierId = async () => {
  return web3.PublicKey.findProgramAddress(
    [anchor_1.utils.bytes.utf8.encode(constants_1.IDENTIFIER_SEED)],
    _1.STAKE_POOL_ADDRESS
  );
};
exports.findIdentifierId = findIdentifierId;
/**
 * Find stake authorization id.
 * @returns
 */
const findStakeAuthorizationId = async (stakePoolId, mintId) => {
  return web3.PublicKey.findProgramAddress(
    [
      anchor_1.utils.bytes.utf8.encode(constants_1.STAKE_AUTHORIZATION_SEED),
      stakePoolId.toBuffer(),
      mintId.toBuffer(),
    ],
    _1.STAKE_POOL_ADDRESS
  );
};
exports.findStakeAuthorizationId = findStakeAuthorizationId;
/**
 * Find stake booster id.
 * @returns
 */
const findStakeBoosterId = async (stakePoolId, identifier) => {
  return web3.PublicKey.findProgramAddress(
    [
      anchor_1.utils.bytes.utf8.encode(constants_1.STAKE_BOOSTER_SEED),
      stakePoolId.toBuffer(),
      (identifier !== null && identifier !== void 0
        ? identifier
        : new anchor_1.BN(0)
      ).toArrayLike(Buffer, "le", 8),
    ],
    _1.STAKE_POOL_ADDRESS
  );
};
exports.findStakeBoosterId = findStakeBoosterId;
//# sourceMappingURL=pda.js.map
