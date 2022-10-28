import { BN, utils } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { STAKE_ENTRY_SEED, STAKE_POOL_ADDRESS, STAKE_POOL_SEED } from ".";
import {
  IDENTIFIER_SEED,
  STAKE_AUTHORIZATION_SEED,
  STAKE_BOOSTER_SEED,
} from "./constants";
/**
 * Finds the stake pool id.
 * @returns
 */
export const findStakePoolId = async (identifier) => {
  return web3.PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(STAKE_POOL_SEED),
      identifier.toArrayLike(Buffer, "le", 8),
    ],
    STAKE_POOL_ADDRESS
  );
};
/**
 * Convenience method to find the stake entry id.
 * @returns
 */
export const findStakeEntryId = async (
  wallet,
  stakePoolId,
  originalMintId,
  isFungible
) => {
  return web3.PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(STAKE_ENTRY_SEED),
      stakePoolId.toBuffer(),
      originalMintId.toBuffer(),
      isFungible ? wallet.toBuffer() : web3.PublicKey.default.toBuffer(),
    ],
    STAKE_POOL_ADDRESS
  );
};
/**
 * Finds the identifier id.
 * @returns
 */
export const findIdentifierId = async () => {
  return web3.PublicKey.findProgramAddress(
    [utils.bytes.utf8.encode(IDENTIFIER_SEED)],
    STAKE_POOL_ADDRESS
  );
};
/**
 * Find stake authorization id.
 * @returns
 */
export const findStakeAuthorizationId = async (stakePoolId, mintId) => {
  return web3.PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(STAKE_AUTHORIZATION_SEED),
      stakePoolId.toBuffer(),
      mintId.toBuffer(),
    ],
    STAKE_POOL_ADDRESS
  );
};
/**
 * Find stake booster id.
 * @returns
 */
export const findStakeBoosterId = async (stakePoolId, identifier) => {
  return web3.PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(STAKE_BOOSTER_SEED),
      stakePoolId.toBuffer(),
      (identifier !== null && identifier !== void 0
        ? identifier
        : new BN(0)
      ).toArrayLike(Buffer, "le", 8),
    ],
    STAKE_POOL_ADDRESS
  );
};
//# sourceMappingURL=pda.js.map
