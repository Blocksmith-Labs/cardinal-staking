"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYS_FOLDER = void 0;
const tslib_1 = require("tslib");
const anchor_1 = require("@project-serum/anchor");
const token_utils_1 = require("@saberhq/token-utils");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = tslib_1.__importDefault(require("fs"));
const api_1 = require("./api");
const rewardDistributor_1 = require("./programs/rewardDistributor");
exports.KEYS_FOLDER = `/Users/mertozgun/.config/solana/bifrost/BFAUyTr7vbPLCLRCfKf436MzU5r4fMoouyyWFvpqpDB5.json`;
const walletKp = new anchor_1.Wallet(
  web3_js_1.Keypair.fromSecretKey(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    new Uint8Array(
      JSON.parse(fs_1.default.readFileSync(exports.KEYS_FOLDER).toString())
    )
  )
);
(async () => {
  // const conn = new Connection("http://191.101.160.247:8080", "confirmed");
  const conn = new web3_js_1.Connection(
    "http://blocksmith-private.sentries.io",
    // "https://metaplex.devnet.rpcpool.com/",
    "confirmed"
  );
  const [transaction1, stakePoolId] = await (0, api_1.createStakePool)(
    conn,
    walletKp,
    {
      // resetOnStake: true,
      requiresCreators: [
        new web3_js_1.PublicKey("8m2b8ar9BNZErJQgSBwY3eCe73yR4k9qHUxxGffxyw2d"),
      ],
    }
  );
  const tx1 = await conn.sendTransaction(transaction1, [walletKp.payer]);
  console.log("stakepool", stakePoolId.toBase58());
  console.log("tx", tx1);
  await (0, token_utils_1.sleep)(2000);
  console.log("reward amount", (12 / 86400) * 1e9);
  const [transaction, rewardDistributorId] = await (0,
  api_1.createRewardDistributor)(conn, walletKp, {
    stakePoolId: stakePoolId,
    rewardMintId: new web3_js_1.PublicKey(
      "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds"
    ),
    kind: rewardDistributor_1.RewardDistributorKind.Treasury,
    rewardAmount: new anchor_1.BN((12 / 86400) * 1e9),
    supply: new anchor_1.BN(50 * 1e9),
  });
  const tx = await conn.sendTransaction(transaction, [walletKp.payer]);
  console.log("rewarddist", rewardDistributorId.toBase58());
  console.log("tx", tx);
})().catch((err) => console.log(err));
//# sourceMappingURL=createPool.js.map
