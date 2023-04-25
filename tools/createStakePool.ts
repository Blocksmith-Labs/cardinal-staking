import { Wallet, utils } from "@project-serum/anchor";
import { SignerWallet } from "@saberhq/solana-contrib";
import * as splToken from "@solana/spl-token";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

import { createStakePool, executeTransaction } from "../src";
import { connectionFor } from "./connection";
import { BN } from "bn.js";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";

const wallet = new Wallet(Keypair.fromSecretKey(utils.bytes.bs58.decode(process.env.WALLET_KEYPAIR))); // your wallet's secret key

const main = async () => {
  const connection = connectionFor("devnet");

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

  const txid = await executeTransaction(connection, wallet, tx, {});

  console.log("Transaction:", txid);
  console.log("Stake pool id:", stakePoolId.toBase58());
  console.log("Reward distributor id:", rewardDistributorId?.toBase58());
};

main().catch((e) => console.log(e));
