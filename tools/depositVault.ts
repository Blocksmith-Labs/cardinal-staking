import {
  executeTransaction,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { findRewardDistributorId } from "@cardinal/rewards-center";
import { Wallet } from "@coral-xyz/anchor";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import * as dotenv from "dotenv";

import { connectionFor } from "./connection";
import { keypairFrom } from "./utils";

dotenv.config();

const wallet = new Wallet(keypairFrom(process.env.WALLET ?? ""));

const main = async () => {
  const connection = connectionFor("devnet");
  console.log("Wallet:", wallet.publicKey.toBase58());

  const mint = new PublicKey("");
  const decimals = 9;
  const amount = LAMPORTS_PER_SOL * 1000;

  const stakePoolId = new PublicKey("");
  const rewardDistributorId = findRewardDistributorId(stakePoolId);
  console.log("Reward Distributor Id:", rewardDistributorId.toBase58());

  const ownerAtaId = getAssociatedTokenAddressSync(
    mint,
    wallet.publicKey,
    true
  );

  const transaction = new Transaction();
  const rewardDistributorAtaId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    mint,
    rewardDistributorId,
    wallet.publicKey,
    true
  );

  transaction.add(
    createTransferCheckedInstruction(
      ownerAtaId,
      mint,
      rewardDistributorAtaId,
      wallet.publicKey,
      amount,
      decimals
    )
  );

  const txid = await executeTransaction(connection, transaction, wallet);
  console.log(`[success] https://explorer.solana.com/tx/${txid}`);
};

main().catch((e) => console.log(e));
