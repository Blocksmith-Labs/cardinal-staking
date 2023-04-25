import { executeTransaction } from "@cardinal/common";
import { BN, Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";

import { createStakePool } from "../src";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";
import { connectionFor } from "./connection";
import { keypairFrom } from "./utils";

dotenv.config();

const wallet = new Wallet(keypairFrom(process.env.WALLET ?? ""));

const main = async () => {
  const connection = connectionFor("devnet");

  /*
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
        new PublicKey("HK5Tf2wDXjvX1veuESXbcehaAjECcZdfnPCDfrcE7dAt"),
      ],
      requiresAuthorization: false,
      cooldownSeconds: 0,
      minStakeSeconds: 0,
    }
  );

  const [tx, stakePoolId] = await withUpdateStakePool(
    transaction,
    connection,
    wallet,
    {
      stakePoolId: new PublicKey(
        "CvQHAb3r1QytPL9GJMYM6VCtWg2ye3UyoEmxbDmWfmHJ"
      ),
      requiresCollections: [
        new PublicKey("3TJmSoAkmf8gTYoybJrxLnUjLP5Kk3vBrzgFeuymvhyA"),
      ],
      requiresCreators: [
        new PublicKey("HK5Tf2wDXjvX1veuESXbcehaAjECcZdfnPCDfrcE7dAt"),
      ],
      requiresAuthorization: false,
      cooldownSeconds: 0,
      minStakeSeconds: 0,
    }
  );

  const txid = await executeTransaction(connection, tx, wallet);

  console.log("Transaction:", txid);
  console.log("Stake pool id:", stakePoolId.toBase58());
  */

  console.log("Wallet:", wallet.publicKey.toBase58());

  const [tx, stakePoolId, rewardDistributorId] = await createStakePool(
    connection,
    wallet,
    {
      requiresAuthorization: false,
      requiresCollections: [
        new PublicKey("3TJmSoAkmf8gTYoybJrxLnUjLP5Kk3vBrzgFeuymvhyA"),
      ],
      requiresCreators: [
        new PublicKey("HK5Tf2wDXjvX1veuESXbcehaAjECcZdfnPCDfrcE7dAt"),
      ],
      cooldownSeconds: 0,
      minStakeSeconds: 0,
      resetOnStake: false,
      rewardDistributor: {
        rewardMintId: new PublicKey(
          "akRiEYA6BWAX8FxaVwEfeDB4yiznadXL5vTBtWg9qj8"
        ),
        rewardAmount: new BN(1_000_000 * 12),
        rewardDurationSeconds: new BN(60),
        rewardDistributorKind: RewardDistributorKind.Treasury,
        supply: new BN(1_000_000 * 1000),
      },
    }
  );

  const txid = await executeTransaction(connection, tx, wallet);

  console.log("Transaction:", txid);
  console.log("Stake pool id:", stakePoolId.toBase58());
  console.log("Reward distributor id:", rewardDistributorId?.toBase58());
};

main().catch((e) => console.log(e));
