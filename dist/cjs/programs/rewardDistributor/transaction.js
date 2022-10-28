"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withReclaimFunds =
  exports.withUpdateRewardDistributor =
  exports.withCloseRewardEntry =
  exports.withUpdateRewardEntry =
  exports.withCloseRewardDistributor =
  exports.withClaimRewards =
  exports.withInitRewardEntry =
  exports.withInitRewardDistributor =
    void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const accounts_1 = require("./accounts");
const constants_1 = require("./constants");
const instruction_1 = require("./instruction");
const pda_1 = require("./pda");
const utils_1 = require("./utils");
const withInitRewardDistributor = async (
  transaction,
  connection,
  wallet,
  params
) => {
  const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(
    params.stakePoolId
  );
  const remainingAccountsForKind = await (0,
  utils_1.withRemainingAccountsForKind)(
    transaction,
    connection,
    wallet,
    rewardDistributorId,
    params.kind || constants_1.RewardDistributorKind.Mint,
    params.rewardMintId
  );
  transaction.add(
    (0, instruction_1.initRewardDistributor)(connection, wallet, {
      rewardDistributorId,
      stakePoolId: params.stakePoolId,
      rewardMintId: params.rewardMintId,
      rewardAmount: params.rewardAmount || new anchor_1.BN(1),
      rewardDurationSeconds: params.rewardDurationSeconds || new anchor_1.BN(1),
      kind: params.kind || constants_1.RewardDistributorKind.Mint,
      remainingAccountsForKind,
      maxSupply: params.maxSupply,
      supply: params.supply,
      defaultMultiplier: params.defaultMultiplier,
      multiplierDecimals: params.multiplierDecimals,
      maxRewardSecondsReceived: params.maxRewardSecondsReceived,
    })
  );
  return [transaction, rewardDistributorId];
};
exports.withInitRewardDistributor = withInitRewardDistributor;
const withInitRewardEntry = async (transaction, connection, wallet, params) => {
  const [rewardEntryId] = await (0, pda_1.findRewardEntryId)(
    params.rewardDistributorId,
    params.stakeEntryId
  );
  transaction.add(
    (0, instruction_1.initRewardEntry)(connection, wallet, {
      stakeEntryId: params.stakeEntryId,
      rewardDistributor: params.rewardDistributorId,
      rewardEntryId: rewardEntryId,
    })
  );
  return [transaction, rewardEntryId];
};
exports.withInitRewardEntry = withInitRewardEntry;
const withClaimRewards = async (transaction, connection, wallet, params) => {
  var _a;
  const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(
    params.stakePoolId
  );
  const rewardDistributorData = await (0, common_1.tryGetAccount)(() =>
    (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId)
  );
  if (rewardDistributorData) {
    const rewardMintTokenAccountId = params.skipRewardMintTokenAccount
      ? await (0, common_1.findAta)(
          rewardDistributorData.parsed.rewardMint,
          params.lastStaker,
          true
        )
      : await (0, common_1.withFindOrInitAssociatedTokenAccount)(
          transaction,
          connection,
          rewardDistributorData.parsed.rewardMint,
          params.lastStaker,
          (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey
        );
    const remainingAccountsForKind = await (0,
    utils_1.withRemainingAccountsForKind)(
      transaction,
      connection,
      wallet,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint,
      true
    );
    const [rewardEntryId] = await (0, pda_1.findRewardEntryId)(
      rewardDistributorData.pubkey,
      params.stakeEntryId
    );
    const rewardEntryData = await (0, common_1.tryGetAccount)(() =>
      (0, accounts_1.getRewardEntry)(connection, rewardEntryId)
    );
    if (!rewardEntryData) {
      transaction.add(
        (0, instruction_1.initRewardEntry)(connection, wallet, {
          stakeEntryId: params.stakeEntryId,
          rewardDistributor: rewardDistributorData.pubkey,
          rewardEntryId: rewardEntryId,
          payer: params.payer,
        })
      );
    }
    transaction.add(
      await (0, instruction_1.claimRewards)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        rewardMintId: rewardDistributorData.parsed.rewardMint,
        rewardMintTokenAccountId: rewardMintTokenAccountId,
        remainingAccountsForKind,
      })
    );
  }
  return transaction;
};
exports.withClaimRewards = withClaimRewards;
const withCloseRewardDistributor = async (
  transaction,
  connection,
  wallet,
  params
) => {
  const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(
    params.stakePoolId
  );
  const rewardDistributorData = await (0, common_1.tryGetAccount)(() =>
    (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId)
  );
  if (rewardDistributorData) {
    const remainingAccountsForKind = await (0,
    utils_1.withRemainingAccountsForKind)(
      transaction,
      connection,
      wallet,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint
    );
    transaction.add(
      await (0, instruction_1.closeRewardDistributor)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        rewardMintId: rewardDistributorData.parsed.rewardMint,
        remainingAccountsForKind,
      })
    );
  }
  return transaction;
};
exports.withCloseRewardDistributor = withCloseRewardDistributor;
const withUpdateRewardEntry = async (
  transaction,
  connection,
  wallet,
  params
) => {
  return transaction.add(
    await (0, instruction_1.updateRewardEntry)(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: params.stakeEntryId,
      multiplier: params.multiplier,
    })
  );
};
exports.withUpdateRewardEntry = withUpdateRewardEntry;
const withCloseRewardEntry = async (
  transaction,
  connection,
  wallet,
  params
) => {
  const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(
    params.stakePoolId
  );
  const [rewardEntryId] = await (0, pda_1.findRewardEntryId)(
    rewardDistributorId,
    params.stakeEntryId
  );
  return transaction.add(
    (0, instruction_1.closeRewardEntry)(connection, wallet, {
      rewardDistributorId: rewardDistributorId,
      rewardEntryId: rewardEntryId,
    })
  );
};
exports.withCloseRewardEntry = withCloseRewardEntry;
const withUpdateRewardDistributor = async (
  transaction,
  connection,
  wallet,
  params
) => {
  const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(
    params.stakePoolId
  );
  return transaction.add(
    (0, instruction_1.updateRewardDistributor)(connection, wallet, {
      rewardDistributorId: rewardDistributorId,
      defaultMultiplier: params.defaultMultiplier || new anchor_1.BN(1),
      multiplierDecimals: params.multiplierDecimals || 0,
      rewardAmount: params.rewardAmount || new anchor_1.BN(0),
      rewardDurationSeconds: params.rewardDurationSeconds || new anchor_1.BN(0),
      maxRewardSecondsReceived: params.maxRewardSecondsReceived,
    })
  );
};
exports.withUpdateRewardDistributor = withUpdateRewardDistributor;
const withReclaimFunds = async (transaction, connection, wallet, params) => {
  const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(
    params.stakePoolId
  );
  const rewardDistributorData = await (0, common_1.tryGetAccount)(() =>
    (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId)
  );
  if (!rewardDistributorData) {
    throw new Error("No reward distrbutor found");
  }
  const rewardDistributorTokenAccountId = await (0, common_1.findAta)(
    rewardDistributorData.parsed.rewardMint,
    rewardDistributorData.pubkey,
    true
  );
  const authorityTokenAccountId = await (0,
  common_1.withFindOrInitAssociatedTokenAccount)(
    transaction,
    connection,
    rewardDistributorData.parsed.rewardMint,
    wallet.publicKey,
    wallet.publicKey,
    true
  );
  return transaction.add(
    (0, instruction_1.reclaimFunds)(connection, wallet, {
      rewardDistributorId: rewardDistributorId,
      rewardDistributorTokenAccountId: rewardDistributorTokenAccountId,
      authorityTokenAccountId: authorityTokenAccountId,
      authority: wallet.publicKey,
      amount: params.amount,
    })
  );
};
exports.withReclaimFunds = withReclaimFunds;
//# sourceMappingURL=transaction.js.map
