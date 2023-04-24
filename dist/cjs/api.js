"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstake = exports.stake = exports.claimRewards = exports.createStakeEntryAndStakeMint = exports.authorizeStakeEntry = exports.initializeRewardEntry = exports.createStakeEntry = exports.createRewardDistributor = exports.createStakePool = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const pda_1 = require("./programs/rewardDistributor/pda");
const transaction_1 = require("./programs/rewardDistributor/transaction");
const stakePool_1 = require("./programs/stakePool");
const accounts_1 = require("./programs/stakePool/accounts");
const transaction_2 = require("./programs/stakePool/transaction");
const utils_1 = require("./programs/stakePool/utils");
const utils_2 = require("./utils");
/**
 * Convenience call to create a stake pool
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param requiresCollections - (Optional) List of required collections pubkeys
 * @param requiresCreators - (Optional) List of required creators pubkeys
 * @param requiresAuthorization - (Optional) Boolean to require authorization
 * @param overlayText - (Optional) Text to overlay on receipt mint tokens
 * @param imageUri - (Optional) Image URI for stake pool
 * @param resetOnStake - (Optional) Boolean to reset an entry's total stake seconds on unstake
 * @param cooldownSeconds - (Optional) Number of seconds for token to cool down before returned to the staker
 * @param rewardDistributor - (Optional) Parameters to creat reward distributor
 * @returns
 */
const createStakePool = async (connection, wallet, params) => {
    const transaction = new web3_js_1.Transaction();
    const [, stakePoolId] = await (0, transaction_2.withInitStakePool)(transaction, connection, wallet, params);
    let rewardDistributorId;
    if (params.rewardDistributor) {
        [, rewardDistributorId] = await (0, transaction_1.withInitRewardDistributor)(transaction, connection, wallet, {
            stakePoolId: stakePoolId,
            rewardMintId: params.rewardDistributor.rewardMintId,
            rewardAmount: params.rewardDistributor.rewardAmount,
            rewardDurationSeconds: params.rewardDistributor.rewardDurationSeconds,
            kind: params.rewardDistributor.rewardDistributorKind,
            maxSupply: params.rewardDistributor.maxSupply,
            supply: params.rewardDistributor.supply,
        });
    }
    return [transaction, stakePoolId, rewardDistributorId];
};
exports.createStakePool = createStakePool;
/**
 * Convenience call to create a reward distributor
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param rewardMintId - (Optional) Reward mint id
 * @param rewardAmount - (Optional) Reward amount
 * @param rewardDurationSeconds - (Optional) Reward duration in seconds
 * @param rewardDistributorKind - (Optional) Reward distributor kind Mint or Treasury
 * @param maxSupply - (Optional) Max supply
 * @param supply - (Optional) Supply
 * @returns
 */
const createRewardDistributor = async (connection, wallet, params) => (0, transaction_1.withInitRewardDistributor)(new web3_js_1.Transaction(), connection, wallet, params);
exports.createRewardDistributor = createRewardDistributor;
/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @returns
 */
const createStakeEntry = async (connection, wallet, params) => {
    return (0, transaction_2.withInitStakeEntry)(new web3_js_1.Transaction(), connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
    });
};
exports.createStakeEntry = createStakeEntry;
/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
const initializeRewardEntry = async (connection, wallet, params) => {
    var _a;
    const [stakeEntryId] = await (0, utils_1.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getStakeEntry)(connection, stakeEntryId));
    const transaction = new web3_js_1.Transaction();
    if (!stakeEntryData) {
        await (0, transaction_2.withInitStakeEntry)(transaction, connection, wallet, {
            stakePoolId: params.stakePoolId,
            originalMintId: params.originalMintId,
        });
    }
    const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(params.stakePoolId);
    await (0, transaction_1.withInitRewardEntry)(transaction, connection, wallet, {
        stakeEntryId: stakeEntryId,
        rewardDistributorId: rewardDistributorId,
    });
    await (0, transaction_1.withUpdateRewardEntry)(transaction, connection, wallet, {
        stakePoolId: params.stakePoolId,
        rewardDistributorId: rewardDistributorId,
        stakeEntryId: stakeEntryId,
        multiplier: (_a = params.multiplier) !== null && _a !== void 0 ? _a : new anchor_1.BN(1), //TODO default multiplier
    });
    return transaction;
};
exports.initializeRewardEntry = initializeRewardEntry;
/**
 * Convenience call to authorize a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
const authorizeStakeEntry = async (connection, wallet, params) => {
    return (0, transaction_2.withAuthorizeStakeEntry)(new web3_js_1.Transaction(), connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
    });
};
exports.authorizeStakeEntry = authorizeStakeEntry;
/**
 * Convenience call to create a stake entry and a stake mint
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
const createStakeEntryAndStakeMint = async (connection, wallet, params) => {
    var _a;
    let transaction = new web3_js_1.Transaction();
    const [stakeEntryId] = await (0, utils_1.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getStakeEntry)(connection, stakeEntryId));
    if (!stakeEntryData) {
        transaction = (await (0, exports.createStakeEntry)(connection, wallet, {
            stakePoolId: params.stakePoolId,
            originalMintId: params.originalMintId,
        }))[0];
    }
    let stakeMintKeypair;
    if (!(stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMint)) {
        stakeMintKeypair = web3_js_1.Keypair.generate();
        const stakePool = await (0, accounts_1.getStakePool)(connection, params.stakePoolId);
        await (0, transaction_2.withInitStakeMint)(transaction, connection, wallet, {
            stakePoolId: params.stakePoolId,
            stakeEntryId: stakeEntryId,
            originalMintId: params.originalMintId,
            stakeMintKeypair,
            name: (_a = params.receiptName) !== null && _a !== void 0 ? _a : `POOl${stakePool.parsed.identifier.toString()} RECEIPT`,
            symbol: `POOl${stakePool.parsed.identifier.toString()}`,
        });
    }
    return [transaction, stakeEntryId, stakeMintKeypair];
};
exports.createStakeEntryAndStakeMint = createStakeEntryAndStakeMint;
/**
 * Convenience method to claim rewards
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param stakeEntryId - Original mint id
 * @returns
 */
const claimRewards = async (connection, wallet, params) => {
    var _a;
    const transaction = new web3_js_1.Transaction();
    (0, transaction_2.withUpdateTotalStakeSeconds)(transaction, connection, wallet, {
        stakeEntryId: params.stakeEntryId,
        lastStaker: wallet.publicKey,
    });
    await (0, transaction_1.withClaimRewards)(transaction, connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        lastStaker: (_a = params.lastStaker) !== null && _a !== void 0 ? _a : wallet.publicKey,
        payer: params.payer,
        skipRewardMintTokenAccount: params.skipRewardMintTokenAccount,
    });
    return transaction;
};
exports.claimRewards = claimRewards;
/**
 * Convenience method to stake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param originalMintId - Original mint id
 * @param userOriginalMintTokenAccountId - User's original mint token account id
 * @param receiptType - (Optional) ReceiptType to be received back. If none provided, none will be claimed
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
const stake = async (connection, wallet, params) => {
    var _a;
    const supply = await (0, utils_2.getMintSupply)(connection, params.originalMintId);
    if ((supply.gt(new anchor_1.BN(1)) || ((_a = params.amount) === null || _a === void 0 ? void 0 : _a.gt(new anchor_1.BN(1)))) &&
        params.receiptType === stakePool_1.ReceiptType.Original) {
        throw new Error("Fungible with receipt type Original is not supported yet");
    }
    let transaction = new web3_js_1.Transaction();
    const [stakeEntryId] = await (0, utils_1.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getStakeEntry)(connection, stakeEntryId));
    if (!stakeEntryData) {
        [transaction] = await (0, exports.createStakeEntry)(connection, wallet, {
            stakePoolId: params.stakePoolId,
            originalMintId: params.originalMintId,
        });
    }
    await (0, transaction_2.withStake)(transaction, connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
        userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
        amount: params.amount,
    });
    if (params.receiptType && params.receiptType !== stakePool_1.ReceiptType.None) {
        const receiptMintId = params.receiptType === stakePool_1.ReceiptType.Receipt
            ? stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMint
            : params.originalMintId;
        if (!receiptMintId) {
            throw new Error("Stake entry has no stake mint. Initialize stake mint first.");
        }
        if ((stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMintClaimed) ||
            (stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.originalMintClaimed)) {
            throw new Error("Receipt has already been claimed.");
        }
        if (!(stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed) ||
            stakeEntryData.parsed.amount.toNumber() === 0) {
            await (0, transaction_2.withClaimReceiptMint)(transaction, connection, wallet, {
                stakePoolId: params.stakePoolId,
                stakeEntryId: stakeEntryId,
                originalMintId: params.originalMintId,
                receiptMintId: receiptMintId,
                receiptType: params.receiptType,
            });
        }
    }
    return transaction;
};
exports.stake = stake;
/**
 * Convenience method to unstake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
const unstake = async (connection, wallet, params) => (0, transaction_2.withUnstake)(new web3_js_1.Transaction(), connection, wallet, params);
exports.unstake = unstake;
//# sourceMappingURL=api.js.map