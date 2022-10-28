import { AnchorProvider, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_IDL } from ".";
import { REWARD_MANAGER } from "./constants";
import { findRewardDistributorId, findRewardEntryId } from "./pda";
export const initRewardDistributor = (connection, wallet, params) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.initRewardDistributor(
    {
      rewardAmount: params.rewardAmount,
      rewardDurationSeconds: params.rewardDurationSeconds,
      maxSupply: params.maxSupply || null,
      supply: params.supply || null,
      kind: params.kind,
      defaultMultiplier: params.defaultMultiplier || null,
      multiplierDecimals: params.multiplierDecimals || null,
      maxRewardSecondsReceived: params.maxRewardSecondsReceived || null,
    },
    {
      accounts: {
        rewardDistributor: params.rewardDistributorId,
        stakePool: params.stakePoolId,
        rewardMint: params.rewardMintId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      remainingAccounts: params.remainingAccountsForKind,
    }
  );
};
export const initRewardEntry = (connection, wallet, params) => {
  var _a;
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.initRewardEntry({
    accounts: {
      rewardEntry: params.rewardEntryId,
      stakeEntry: params.stakeEntryId,
      rewardDistributor: params.rewardDistributor,
      payer:
        (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};
export const claimRewards = async (connection, wallet, params) => {
  var _a;
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributorId,
    params.stakeEntryId
  );
  return rewardDistributorProgram.instruction.claimRewards({
    accounts: {
      rewardEntry: rewardEntryId,
      rewardDistributor: rewardDistributorId,
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      rewardMint: params.rewardMintId,
      userRewardMintTokenAccount: params.rewardMintTokenAccountId,
      rewardManager: REWARD_MANAGER,
      user:
        (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts: [...params.remainingAccountsForKind],
  });
};
export const closeRewardDistributor = async (connection, wallet, params) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  return rewardDistributorProgram.instruction.closeRewardDistributor({
    accounts: {
      rewardDistributor: rewardDistributorId,
      stakePool: params.stakePoolId,
      rewardMint: params.rewardMintId,
      signer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: params.remainingAccountsForKind,
  });
};
export const updateRewardEntry = async (connection, wallet, params) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributorId,
    params.stakeEntryId
  );
  return rewardDistributorProgram.instruction.updateRewardEntry(
    {
      multiplier: params.multiplier,
    },
    {
      accounts: {
        rewardEntry: rewardEntryId,
        rewardDistributor: rewardDistributorId,
        authority: wallet.publicKey,
      },
    }
  );
};
export const closeRewardEntry = (connection, wallet, params) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.closeRewardEntry({
    accounts: {
      rewardDistributor: params.rewardDistributorId,
      rewardEntry: params.rewardEntryId,
      authority: wallet.publicKey,
    },
  });
};
export const updateRewardDistributor = (connection, wallet, params) => {
  var _a;
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.updateRewardDistributor(
    {
      defaultMultiplier: params.defaultMultiplier,
      multiplierDecimals: params.multiplierDecimals,
      rewardAmount: params.rewardAmount,
      rewardDurationSeconds: params.rewardDurationSeconds,
      maxRewardSecondsReceived:
        (_a = params.maxRewardSecondsReceived) !== null && _a !== void 0
          ? _a
          : null,
    },
    {
      accounts: {
        rewardDistributor: params.rewardDistributorId,
        authority: wallet.publicKey,
      },
    }
  );
};
export const reclaimFunds = (connection, wallet, params) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.reclaimFunds(params.amount, {
    accounts: {
      rewardDistributor: params.rewardDistributorId,
      rewardDistributorTokenAccount: params.rewardDistributorTokenAccountId,
      authorityTokenAccount: params.authorityTokenAccountId,
      authority: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
};
//# sourceMappingURL=instruction.js.map
