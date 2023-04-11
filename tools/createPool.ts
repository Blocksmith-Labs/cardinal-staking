import { executeTransaction } from "@cardinal/common";
import { Wallet } from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import * as dotenv from "dotenv";

import { withInitStakePool } from "../src/programs/stakePool/transaction";
import { connectionFor } from "./connection";
import { keypairFrom } from "./utils";

dotenv.config();

const wallet = new Wallet(keypairFrom(process.env.WALLET ?? ""));

const main = async () => {
  const connection = connectionFor("devnet");
  const transaction = new Transaction();
  const [tx, stakePoolId] = await withInitStakePool(
    transaction,
    connection,
    wallet,
    {
      requiresCollections: [
        new PublicKey("71KGPZGpBQ7gRN7DbjCWyt3nvG5a6UL4N4MDMiawu7Ai"),
      ],
      requiresCreators: [
        new PublicKey("594WQxpBu4vVDhhW2K7QoNMZaN6j9znxajcZX13as7HD"),
        new PublicKey("FSgGK5A3uLZhBZATwWDgk7pxeGx35Uimn6DzTC4qDVfv"),
        new PublicKey("HK5Tf2wDXjvX1veuESXbcehaAjECcZdfnPCDfrcE7dAt"),
      ],
      requiresAuthorization: true,
      cooldownSeconds: 0,
      minStakeSeconds: 0,
    }
  );
  const txid = await executeTransaction(connection, tx, wallet);

  console.log("Transaction:", txid);
  console.log("Stake pool id:", stakePoolId.toBase58());
};

main().catch((e) => console.log(e));
