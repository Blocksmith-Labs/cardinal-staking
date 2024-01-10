"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenAddress = exports.calculatePendingRewards = exports.getRewardMap = exports.getPendingRewardsForPool = exports.getMintSupply = exports.executeTransaction = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const accounts_1 = require("./programs/rewardDistributor/accounts");
const pda_1 = require("./programs/rewardDistributor/pda");
const accounts_2 = require("./programs/stakePool/accounts");
const utils_1 = require("./programs/stakePool/utils");
const executeTransaction = async (connection, wallet, transaction, config) => {
    let txid = "";
    try {
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash("max")).blockhash;
        transaction = await wallet.signTransaction(transaction);
        if (config.signers && config.signers.length > 0) {
            transaction.partialSign(...config.signers);
        }
        txid = await (0, web3_js_1.sendAndConfirmRawTransaction)(connection, transaction.serialize(), config.confirmOptions);
        config.callback && config.callback(true);
    }
    catch (e) {
        console.log("Failed transaction: ", e.logs, e);
        config.callback && config.callback(false);
        if (!config.silent) {
            throw e;
        }
    }
    return txid;
};
exports.executeTransaction = executeTransaction;
/**
 * Get total supply of mint
 * @param connection
 * @param originalMintId
 * @returns
 */
const getMintSupply = async (connection, originalMintId) => {
    return new anchor_1.BN((await (0, spl_token_1.getMint)(connection, originalMintId)).supply.toString());
};
exports.getMintSupply = getMintSupply;
/**
 * Get pending rewards of mintIds for a given reward distributor
 * @param connection
 * @param wallet
 * @param mintIds
 * @param rewardDistributor
 * @returns
 */
const getPendingRewardsForPool = async (connection, wallet, mintIds, rewardDistributor, UTCNow) => {
    const rewardDistributorTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(rewardDistributor.parsed.rewardMint, rewardDistributor.pubkey, true);
    const rewardDistributorTokenAccountInfo = await (0, spl_token_1.getAccount)(connection, rewardDistributorTokenAccount);
    const stakeEntryIds = await Promise.all(mintIds.map(async (mintId) => (0, utils_1.findStakeEntryIdFromMint)(connection, wallet, rewardDistributor.parsed.stakePool, mintId)));
    const rewardEntryIds = stakeEntryIds.map((stakeEntryId) => (0, pda_1.findRewardEntryId)(rewardDistributor.pubkey, stakeEntryId));
    const [stakeEntries, rewardEntries] = await Promise.all([
        (0, accounts_2.getStakeEntries)(connection, stakeEntryIds),
        (0, accounts_1.getRewardEntries)(connection, rewardEntryIds),
    ]);
    return (0, exports.getRewardMap)(stakeEntries, rewardEntries, rewardDistributor, new anchor_1.BN(rewardDistributorTokenAccountInfo.amount.toString()), UTCNow);
};
exports.getPendingRewardsForPool = getPendingRewardsForPool;
/**
 * Get the map of rewards for stakeEntry to rewards and next reward time
 * Also return the total claimable rewards from this map
 * @param stakeEntries
 * @param rewardEntries
 * @param rewardDistributor
 * @param remainingRewardAmount
 * @returns
 */
const getRewardMap = (stakeEntries, rewardEntries, rewardDistributor, remainingRewardAmount, UTCNow) => {
    const rewardMap = {};
    for (let i = 0; i < stakeEntries.length; i++) {
        const stakeEntry = stakeEntries[i];
        const rewardEntry = rewardEntries.find((rewardEntry) => { var _a; return (_a = rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed) === null || _a === void 0 ? void 0 : _a.stakeEntry.equals(stakeEntry === null || stakeEntry === void 0 ? void 0 : stakeEntry.pubkey); });
        if (stakeEntry) {
            const [claimableRewards, nextRewardsIn] = (0, exports.calculatePendingRewards)(rewardDistributor, stakeEntry, rewardEntry, remainingRewardAmount, UTCNow);
            rewardMap[stakeEntry.pubkey.toString()] = {
                claimableRewards,
                nextRewardsIn,
            };
        }
    }
    // Compute too many rewards
    let claimableRewards = Object.values(rewardMap).reduce((acc, { claimableRewards }) => acc.add(claimableRewards), new anchor_1.BN(0));
    if (rewardDistributor.parsed.maxSupply &&
        rewardDistributor.parsed.rewardsIssued
            .add(claimableRewards)
            .gte(rewardDistributor.parsed.maxSupply)) {
        claimableRewards = rewardDistributor.parsed.maxSupply.sub(rewardDistributor.parsed.rewardsIssued);
    }
    if (claimableRewards.gt(remainingRewardAmount)) {
        claimableRewards = remainingRewardAmount;
    }
    return { rewardMap, claimableRewards };
};
exports.getRewardMap = getRewardMap;
/**
 * Calculate claimable rewards and next reward time for a give mint and reward and stake entry
 * @param rewardDistributor
 * @param stakeEntry
 * @param rewardEntry
 * @param remainingRewardAmount
 * @param UTCNow
 * @returns
 */
const calculatePendingRewards = (rewardDistributor, stakeEntry, rewardEntry, remainingRewardAmount, UTCNow) => {
    var _a, _b, _c;
    if (!stakeEntry ||
        stakeEntry.parsed.pool.toString() !==
            rewardDistributor.parsed.stakePool.toString()) {
        return [new anchor_1.BN(0), new anchor_1.BN(0)];
    }
    const rewardSecondsReceived = (rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed.rewardSecondsReceived) || new anchor_1.BN(0);
    const multiplier = ((_a = rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed) === null || _a === void 0 ? void 0 : _a.multiplier) ||
        rewardDistributor.parsed.defaultMultiplier;
    let rewardSeconds = (stakeEntry.parsed.cooldownStartSeconds || new anchor_1.BN(UTCNow))
        .sub((_b = stakeEntry.parsed.lastUpdatedAt) !== null && _b !== void 0 ? _b : stakeEntry.parsed.lastStakedAt)
        .mul(stakeEntry.parsed.amount)
        .add(stakeEntry.parsed.totalStakeSeconds);
    if (rewardDistributor.parsed.maxRewardSecondsReceived) {
        rewardSeconds = anchor_1.BN.min(rewardSeconds, rewardDistributor.parsed.maxRewardSecondsReceived);
    }
    let rewardAmountToReceive = rewardSeconds
        .sub(rewardSecondsReceived)
        .div(rewardDistributor.parsed.rewardDurationSeconds)
        .mul(rewardDistributor.parsed.rewardAmount)
        .mul(multiplier)
        .div(new anchor_1.BN(10).pow(new anchor_1.BN(rewardDistributor.parsed.multiplierDecimals)));
    if (rewardDistributor.parsed.maxSupply &&
        rewardDistributor.parsed.rewardsIssued
            .add(rewardAmountToReceive)
            .gte(rewardDistributor.parsed.maxSupply)) {
        rewardAmountToReceive = rewardDistributor.parsed.maxSupply.sub(rewardDistributor.parsed.rewardsIssued);
    }
    if (rewardAmountToReceive.gt(remainingRewardAmount)) {
        rewardAmountToReceive = remainingRewardAmount;
    }
    const nextRewardsIn = rewardDistributor.parsed.rewardDurationSeconds.sub((stakeEntry.parsed.cooldownStartSeconds || new anchor_1.BN(UTCNow))
        .sub((_c = stakeEntry.parsed.lastUpdatedAt) !== null && _c !== void 0 ? _c : stakeEntry.parsed.lastStakedAt)
        .add(stakeEntry.parsed.totalStakeSeconds)
        .mod(rewardDistributor.parsed.rewardDurationSeconds));
    return [rewardAmountToReceive, nextRewardsIn];
};
exports.calculatePendingRewards = calculatePendingRewards;
const getTokenAddress = async (connection, mint, owner) => {
    var _a;
    const defaultAta = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, owner, true);
    try {
        const defaultAccount = await (0, spl_token_1.getAccount)(connection, defaultAta);
        if (defaultAccount.amount > 0) {
            return defaultAta;
        }
    }
    catch {
    }
    const largestHolders = await connection.getTokenLargestAccounts(mint);
    const validHolders = largestHolders.value.filter(t => { var _a; return ((_a = t.uiAmount) !== null && _a !== void 0 ? _a : 0) > 0; });
    if (validHolders.length == 0) {
        return;
    }
    return (_a = validHolders[0]) === null || _a === void 0 ? void 0 : _a.address;
};
exports.getTokenAddress = getTokenAddress;
//# sourceMappingURL=utils.js.map