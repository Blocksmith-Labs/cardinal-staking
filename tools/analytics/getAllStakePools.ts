import type { Wallet } from "@project-serum/anchor";
import type { Connection } from "@solana/web3.js";

import { getAllStakePools } from "../../src/programs/stakePool/accounts";

export const commandName = "getAllStakePools";
export const description = "Get stake pool IDs";

export const getArgs = (_connection: Connection, _wallet: Wallet) => ({});

export const handler = async (
  connection: Connection,
  _wallet: Wallet,
  _args: ReturnType<typeof getArgs>
) => {
  const stakePools = await getAllStakePools(connection);
  console.log(stakePools.map((p) => p.pubkey.toString()).join(","));
};
