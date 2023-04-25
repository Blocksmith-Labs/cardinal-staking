import type { ParsedIdlAccountData } from "@cardinal/common";
import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";

import * as REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_reward_distributor";

export const REWARD_DISTRIBUTOR_ADDRESS = new PublicKey(
  "6566pw1vumw5aw7FKX2iFydBzAF1ubuzPcGxH4vUD5XN"
);
export const REWARD_MANAGER = new PublicKey(
  "crkdpVWjHWdggGgBuSyAqSmZUmAjYLzD435tcLDRLXr"
);

export const REWARD_ENTRY_SEED = "reward-entry";

export const REWARD_DISTRIBUTOR_SEED = "reward-distributor";

export type REWARD_DISTRIBUTOR_PROGRAM =
  REWARD_DISTRIBUTOR_TYPES.CardinalRewardDistributor;

export const REWARD_DISTRIBUTOR_IDL = REWARD_DISTRIBUTOR_TYPES.IDL;

export type RewardEntryData = ParsedIdlAccountData<
  "rewardEntry",
  REWARD_DISTRIBUTOR_PROGRAM
>;
export type RewardDistributorData = ParsedIdlAccountData<
  "rewardDistributor",
  REWARD_DISTRIBUTOR_PROGRAM
>;

export enum RewardDistributorKind {
  Mint = 1,
  Treasury = 2,
}

export const rewardDistributorProgram = (
  connection: Connection,
  wallet?: Wallet,
  confirmOptions?: ConfirmOptions
) => {
  return new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    new AnchorProvider(
      connection,
      wallet ?? emptyWallet(Keypair.generate().publicKey),
      confirmOptions ?? {}
    )
  );
};
