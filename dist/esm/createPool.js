import { BN, Wallet } from "@project-serum/anchor";
import { sleep } from "@saberhq/token-utils";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import { createRewardDistributor, createStakePool } from "./api";
import { RewardDistributorKind } from "./programs/rewardDistributor";
export const KEYS_FOLDER = `/Users/mertozgun/.config/solana/bifrost/BFAUyTr7vbPLCLRCfKf436MzU5r4fMoouyyWFvpqpDB5.json`;
const walletKp = new Wallet(
  Keypair.fromSecretKey(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    new Uint8Array(JSON.parse(fs.readFileSync(KEYS_FOLDER).toString()))
  )
);
(async () => {
  // const conn = new Connection("http://191.101.160.247:8080", "confirmed");
  const conn = new Connection(
    "http://blocksmith-private.sentries.io",
    // "https://metaplex.devnet.rpcpool.com/",
    "confirmed"
  );
  const [transaction1, stakePoolId] = await createStakePool(conn, walletKp, {
    // resetOnStake: true,
    requiresCreators: [
      new PublicKey("8m2b8ar9BNZErJQgSBwY3eCe73yR4k9qHUxxGffxyw2d"),
    ],
  });
  const tx1 = await conn.sendTransaction(transaction1, [walletKp.payer]);
  console.log("stakepool", stakePoolId.toBase58());
  console.log("tx", tx1);
  await sleep(2000);
  console.log("reward amount", (12 / 86400) * 1e9);
  const [transaction, rewardDistributorId] = await createRewardDistributor(
    conn,
    walletKp,
    {
      stakePoolId: stakePoolId,
      rewardMintId: new PublicKey(
        "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds"
      ),
      kind: RewardDistributorKind.Treasury,
      rewardAmount: new BN((12 / 86400) * 1e9),
      supply: new BN(50 * 1e9),
    }
  );
  const tx = await conn.sendTransaction(transaction, [walletKp.payer]);
  console.log("rewarddist", rewardDistributorId.toBase58());
  console.log("tx", tx);
})().catch((err) => console.log(err));
//# sourceMappingURL=createPool.js.map
