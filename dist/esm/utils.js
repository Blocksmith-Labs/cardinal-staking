import { findAta } from "@cardinal/common";
import { BN } from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Keypair, sendAndConfirmRawTransaction } from "@solana/web3.js";
import { getRewardEntries } from "./programs/rewardDistributor/accounts";
import { findRewardEntryId } from "./programs/rewardDistributor/pda";
import { getStakeEntries } from "./programs/stakePool/accounts";
import { findStakeEntryIdFromMint } from "./programs/stakePool/utils";
export const executeTransaction = async (connection, wallet, transaction, config) => {
    let txid = "";
    try {
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash("max")).blockhash;
        await wallet.signTransaction(transaction);
        if (config.signers && config.signers.length > 0) {
            transaction.partialSign(...config.signers);
        }
        txid = await sendAndConfirmRawTransaction(connection, transaction.serialize(), config.confirmOptions);
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
/**
 * Get total supply of mint
 * @param connection
 * @param originalMintId
 * @returns
 */
export const getMintSupply = async (connection, originalMintId) => {
    const mint = new splToken.Token(connection, originalMintId, splToken.TOKEN_PROGRAM_ID, 
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    null);
    return (await mint.getMintInfo()).supply;
};
/**
 * Get pending rewards of mintIds for a given reward distributor
 * @param connection
 * @param wallet
 * @param mintIds
 * @param rewardDistributor
 * @returns
 */
export const getPendingRewardsForPool = async (connection, wallet, mintIds, rewardDistributor, UTCNow) => {
    const rewardDistributorTokenAccount = await findAta(rewardDistributor.parsed.rewardMint, rewardDistributor.pubkey, true);
    const rewardMint = new splToken.Token(connection, rewardDistributor.parsed.rewardMint, splToken.TOKEN_PROGRAM_ID, Keypair.generate() // not used
    );
    const rewardDistributorTokenAccountInfo = await rewardMint.getAccountInfo(rewardDistributorTokenAccount);
    const stakeEntryIds = await Promise.all(mintIds.map(async (mintId) => (await findStakeEntryIdFromMint(connection, wallet, rewardDistributor.parsed.stakePool, mintId))[0]));
    const rewardEntryIds = await Promise.all(stakeEntryIds.map(async (stakeEntryId) => (await findRewardEntryId(rewardDistributor.pubkey, stakeEntryId))[0]));
    const [stakeEntries, rewardEntries] = await Promise.all([
        getStakeEntries(connection, stakeEntryIds),
        getRewardEntries(connection, rewardEntryIds),
    ]);
    return getRewardMap(stakeEntries, rewardEntries, rewardDistributor, rewardDistributorTokenAccountInfo.amount, UTCNow);
};
/**
 * Get the map of rewards for stakeEntry to rewards and next reward time
 * Also return the total claimable rewards from this map
 * @param stakeEntries
 * @param rewardEntries
 * @param rewardDistributor
 * @param remainingRewardAmount
 * @returns
 */
export const getRewardMap = (stakeEntries, rewardEntries, rewardDistributor, remainingRewardAmount, UTCNow) => {
    const rewardMap = {};
    for (let i = 0; i < stakeEntries.length; i++) {
        const stakeEntry = stakeEntries[i];
        const rewardEntry = rewardEntries.find((rewardEntry) => { var _a; return (_a = rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed) === null || _a === void 0 ? void 0 : _a.stakeEntry.equals(stakeEntry === null || stakeEntry === void 0 ? void 0 : stakeEntry.pubkey); });
        if (stakeEntry) {
            const [claimableRewards, nextRewardsIn] = calculatePendingRewards(rewardDistributor, stakeEntry, rewardEntry, remainingRewardAmount, UTCNow);
            rewardMap[stakeEntry.pubkey.toString()] = {
                claimableRewards,
                nextRewardsIn,
            };
        }
    }
    // Compute too many rewards
    let claimableRewards = Object.values(rewardMap).reduce((acc, { claimableRewards }) => acc.add(claimableRewards), new BN(0));
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
/**
 * Calculate claimable rewards and next reward time for a give mint and reward and stake entry
 * @param rewardDistributor
 * @param stakeEntry
 * @param rewardEntry
 * @param remainingRewardAmount
 * @param UTCNow
 * @returns
 */
export const calculatePendingRewards = (rewardDistributor, stakeEntry, rewardEntry, remainingRewardAmount, UTCNow) => {
    var _a;
    if (!stakeEntry ||
        stakeEntry.parsed.pool.toString() !==
            rewardDistributor.parsed.stakePool.toString()) {
        return [new BN(0), new BN(0)];
    }
    const rewardSecondsReceived = (rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed.rewardSecondsReceived) || new BN(0);
    const multiplier = ((_a = rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed) === null || _a === void 0 ? void 0 : _a.multiplier) ||
        rewardDistributor.parsed.defaultMultiplier;
    let rewardSeconds = (stakeEntry.parsed.cooldownStartSeconds || new BN(UTCNow))
        .sub(stakeEntry.parsed.lastStakedAt)
        .mul(stakeEntry.parsed.amount)
        .add(stakeEntry.parsed.totalStakeSeconds);
    if (rewardDistributor.parsed.maxRewardSecondsReceived) {
        rewardSeconds = BN.min(rewardSeconds, rewardDistributor.parsed.maxRewardSecondsReceived);
    }
    let rewardAmountToReceive = rewardSeconds
        .sub(rewardSecondsReceived)
        .div(rewardDistributor.parsed.rewardDurationSeconds)
        .mul(rewardDistributor.parsed.rewardAmount)
        .mul(multiplier)
        .div(new BN(10).pow(new BN(rewardDistributor.parsed.multiplierDecimals)));
    if (rewardDistributor.parsed.maxSupply &&
        rewardDistributor.parsed.rewardsIssued
            .add(rewardAmountToReceive)
            .gte(rewardDistributor.parsed.maxSupply)) {
        rewardAmountToReceive = rewardDistributor.parsed.maxSupply.sub(rewardDistributor.parsed.rewardsIssued);
    }
    if (rewardAmountToReceive.gt(remainingRewardAmount)) {
        rewardAmountToReceive = remainingRewardAmount;
    }
    const nextRewardsIn = rewardDistributor.parsed.rewardDurationSeconds.sub((stakeEntry.parsed.cooldownStartSeconds || new BN(UTCNow))
        .sub(stakeEntry.parsed.lastStakedAt)
        .add(stakeEntry.parsed.totalStakeSeconds)
        .mod(rewardDistributor.parsed.rewardDurationSeconds));
    return [rewardAmountToReceive, nextRewardsIn];
};
//# sourceMappingURL=utils.js.map