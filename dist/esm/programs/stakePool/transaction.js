import { findAta, tryGetAccount, withFindOrInitAssociatedTokenAccount, } from "@cardinal/common";
import * as metaplex from "@metaplex-foundation/mpl-token-metadata";
import { BN } from "@project-serum/anchor";
import { tokenManager } from "cardinal-token-manager/dist/cjs/programs";
import { withRemainingAccountsForReturn } from "cardinal-token-manager/dist/cjs/programs/tokenManager";
import { findMintManagerId, findTokenManagerAddress, tokenManagerAddressFromMint, } from "cardinal-token-manager/dist/cjs/programs/tokenManager/pda";
import { getMintSupply } from "../../utils";
import { getRewardDistributor } from "../rewardDistributor/accounts";
import { findRewardDistributorId } from "../rewardDistributor/pda";
import { withClaimRewards } from "../rewardDistributor/transaction";
import { getPoolIdentifier, getStakeEntry, getStakePool } from "./accounts";
import { ReceiptType } from "./constants";
import { authorizeStakeEntry, claimReceiptMint, closeStakeBooster, closeStakeEntry, closeStakePool, deauthorizeStakeEntry, initPoolIdentifier, initStakeBooster, initStakeEntry, initStakeMint, initStakePool, reassignStakeEntry, returnReceiptMint, stake, unstake, updateStakeBooster, updateStakePool, updateTotalStakeSeconds, } from "./instruction";
import { findIdentifierId, findStakePoolId } from "./pda";
import { findStakeEntryIdFromMint, withRemainingAccountsForUnstake, } from "./utils";
/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
export const withInitPoolIdentifier = async (transaction, connection, wallet) => {
    const [identifierId] = await findIdentifierId();
    transaction.add(initPoolIdentifier(connection, wallet, {
        identifierId: identifierId,
    }));
    return [transaction, identifierId];
};
export const withInitStakePool = async (transaction, connection, wallet, params) => {
    const [identifierId] = await findIdentifierId();
    const identifierData = await tryGetAccount(() => getPoolIdentifier(connection));
    const identifier = (identifierData === null || identifierData === void 0 ? void 0 : identifierData.parsed.count) || new BN(1);
    if (!identifierData) {
        transaction.add(initPoolIdentifier(connection, wallet, {
            identifierId: identifierId,
        }));
    }
    const [stakePoolId] = await findStakePoolId(identifier);
    transaction.add(initStakePool(connection, wallet, {
        identifierId: identifierId,
        stakePoolId: stakePoolId,
        requiresCreators: params.requiresCreators || [],
        requiresCollections: params.requiresCollections || [],
        requiresAuthorization: params.requiresAuthorization,
        overlayText: params.overlayText || "",
        imageUri: params.imageUri || "",
        authority: wallet.publicKey,
        resetOnStake: params.resetOnStake || false,
        cooldownSeconds: params.cooldownSeconds,
        minStakeSeconds: params.minStakeSeconds,
        endDate: params.endDate,
    }));
    return [transaction, stakePoolId];
};
/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
export const withInitStakeEntry = async (transaction, connection, wallet, params) => {
    const [[stakeEntryId], originalMintMetadatId] = await Promise.all([
        findStakeEntryIdFromMint(connection, wallet.publicKey, params.stakePoolId, params.originalMintId),
        metaplex.Metadata.getPDA(params.originalMintId),
    ]);
    transaction.add(await initStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: stakeEntryId,
        originalMintId: params.originalMintId,
        originalMintMetadatId: originalMintMetadatId,
    }));
    return [transaction, stakeEntryId];
};
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withAuthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    transaction.add(await authorizeStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
    }));
    return transaction;
};
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withDeauthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    transaction.add(await deauthorizeStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
    }));
    return transaction;
};
/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
export const withInitStakeMint = async (transaction, connection, wallet, params) => {
    const [[mintManagerId], originalMintMetadataId, stakeMintMetadataId] = await Promise.all([
        findMintManagerId(params.stakeMintKeypair.publicKey),
        metaplex.Metadata.getPDA(params.originalMintId),
        metaplex.Metadata.getPDA(params.stakeMintKeypair.publicKey),
    ]);
    const stakeEntryStakeMintTokenAccountId = await findAta(params.stakeMintKeypair.publicKey, params.stakeEntryId, true);
    transaction.add(initStakeMint(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        originalMintId: params.originalMintId,
        originalMintMetadatId: originalMintMetadataId,
        stakeEntryStakeMintTokenAccountId: stakeEntryStakeMintTokenAccountId,
        stakeMintId: params.stakeMintKeypair.publicKey,
        stakeMintMetadataId: stakeMintMetadataId,
        mintManagerId: mintManagerId,
        name: params.name,
        symbol: params.symbol,
    }));
    return [transaction, params.stakeMintKeypair];
};
/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withClaimReceiptMint = async (transaction, connection, wallet, params) => {
    if (params.receiptType === ReceiptType.Original &&
        (await getMintSupply(connection, params.receiptMintId)).gt(new BN(1))) {
        throw new Error("Fungible staking and locked reecipt type not supported yet");
    }
    const tokenManagerReceiptMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.receiptMintId, (await findTokenManagerAddress(params.receiptMintId))[0], wallet.publicKey, true);
    transaction.add(await claimReceiptMint(connection, wallet, {
        stakeEntryId: params.stakeEntryId,
        tokenManagerReceiptMintTokenAccountId: tokenManagerReceiptMintTokenAccountId,
        originalMintId: params.originalMintId,
        receiptMintId: params.receiptMintId,
        receiptType: params.receiptType,
    }));
    return transaction;
};
/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withStake = async (transaction, connection, wallet, params) => {
    const [stakeEntryId] = await findStakeEntryIdFromMint(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    const stakeEntryOriginalMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    transaction.add(stake(connection, wallet, {
        stakeEntryId: stakeEntryId,
        stakePoolId: params.stakePoolId,
        originalMint: params.originalMintId,
        stakeEntryOriginalMintTokenAccountId: stakeEntryOriginalMintTokenAccountId,
        userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
        amount: params.amount || new BN(1),
    }));
    return transaction;
};
/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withUnstake = async (transaction, connection, wallet, params) => {
    const [[stakeEntryId], [rewardDistributorId]] = await Promise.all([
        findStakeEntryIdFromMint(connection, wallet.publicKey, params.stakePoolId, params.originalMintId),
        await findRewardDistributorId(params.stakePoolId),
    ]);
    const [stakeEntryData, rewardDistributorData] = await Promise.all([
        tryGetAccount(() => getStakeEntry(connection, stakeEntryId)),
        tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId)),
    ]);
    if (!stakeEntryData)
        throw "Stake entry not found";
    const stakePoolData = await getStakePool(connection, params.stakePoolId);
    if ((!stakePoolData.parsed.cooldownSeconds ||
        stakePoolData.parsed.cooldownSeconds === 0 ||
        ((stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.cooldownStartSeconds) &&
            Date.now() / 1000 -
                stakeEntryData.parsed.cooldownStartSeconds.toNumber() >=
                stakePoolData.parsed.cooldownSeconds)) &&
        (!stakePoolData.parsed.minStakeSeconds ||
            stakePoolData.parsed.minStakeSeconds === 0 ||
            ((stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.lastStakedAt) &&
                Date.now() / 1000 - stakeEntryData.parsed.lastStakedAt.toNumber() >=
                    stakePoolData.parsed.minStakeSeconds)) &&
        (stakeEntryData.parsed.originalMintClaimed ||
            stakeEntryData.parsed.stakeMintClaimed)) {
        // return receipt mint if its claimed
        await withReturnReceiptMint(transaction, connection, wallet, {
            stakeEntryId: stakeEntryId,
        });
    }
    const stakeEntryOriginalMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    const userOriginalMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.originalMintId, wallet.publicKey, wallet.publicKey);
    const remainingAccounts = await withRemainingAccountsForUnstake(transaction, connection, wallet, stakeEntryId, stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMint);
    transaction.add(unstake(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: stakeEntryId,
        originalMintId: params.originalMintId,
        user: wallet.publicKey,
        stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
        userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
        remainingAccounts,
    }));
    // claim any rewards deserved
    if (rewardDistributorData) {
        await withClaimRewards(transaction, connection, wallet, {
            stakePoolId: params.stakePoolId,
            stakeEntryId: stakeEntryId,
            lastStaker: wallet.publicKey,
            skipRewardMintTokenAccount: params.skipRewardMintTokenAccount,
        });
    }
    return transaction;
};
export const withUpdateStakePool = (transaction, connection, wallet, params) => {
    transaction.add(updateStakePool(connection, wallet, {
        stakePoolId: params.stakePoolId,
        requiresCreators: params.requiresCreators || [],
        requiresCollections: params.requiresCollections || [],
        requiresAuthorization: params.requiresAuthorization || false,
        overlayText: params.overlayText || "STAKED",
        imageUri: params.imageUri || "",
        authority: wallet.publicKey,
        resetOnStake: params.resetOnStake || false,
        cooldownSeconds: params.cooldownSeconds,
        minStakeSeconds: params.minStakeSeconds,
        endDate: params.endDate,
    }));
    return [transaction, params.stakePoolId];
};
export const withUpdateTotalStakeSeconds = (transaction, connection, wallet, params) => {
    transaction.add(updateTotalStakeSeconds(connection, wallet, {
        stakEntryId: params.stakeEntryId,
        lastStaker: params.lastStaker,
    }));
    return transaction;
};
export const withReturnReceiptMint = async (transaction, connection, wallet, params) => {
    const stakeEntryData = await tryGetAccount(() => getStakeEntry(connection, params.stakeEntryId));
    if (!stakeEntryData) {
        throw new Error(`Stake entry ${params.stakeEntryId.toString()} not found`);
    }
    if (!stakeEntryData.parsed.stakeMintClaimed &&
        !stakeEntryData.parsed.originalMintClaimed) {
        console.log("No receipt mint to return");
        return transaction;
    }
    const receiptMint = stakeEntryData.parsed.stakeMint && stakeEntryData.parsed.stakeMintClaimed
        ? stakeEntryData.parsed.stakeMint
        : stakeEntryData.parsed.originalMint;
    const tokenManagerId = await tokenManagerAddressFromMint(connection, receiptMint);
    const tokenManagerData = await tryGetAccount(() => tokenManager.accounts.getTokenManager(connection, tokenManagerId));
    if (!tokenManagerData) {
        return transaction;
    }
    const remainingAccountsForReturn = await withRemainingAccountsForReturn(transaction, connection, wallet, tokenManagerData);
    transaction.add(await returnReceiptMint(connection, wallet, {
        stakeEntry: params.stakeEntryId,
        receiptMint: receiptMint,
        tokenManagerKind: tokenManagerData.parsed.kind,
        tokenManagerState: tokenManagerData.parsed.state,
        returnAccounts: remainingAccountsForReturn,
    }));
    return transaction;
};
export const withCloseStakePool = (transaction, connection, wallet, params) => {
    transaction.add(closeStakePool(connection, wallet, {
        stakePoolId: params.stakePoolId,
        authority: wallet.publicKey,
    }));
    return transaction;
};
export const withCloseStakeEntry = (transaction, connection, wallet, params) => {
    transaction.add(closeStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        authority: wallet.publicKey,
    }));
    return transaction;
};
export const withReassignStakeEntry = (transaction, connection, wallet, params) => {
    transaction.add(reassignStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        target: params.target,
    }));
    return transaction;
};
export const withInitStakeBooster = async (transaction, connection, wallet, params) => {
    transaction.add(await initStakeBooster(connection, wallet, {
        ...params,
    }));
    return transaction;
};
export const withUpdateStakeBooster = async (transaction, connection, wallet, params) => {
    transaction.add(await updateStakeBooster(connection, wallet, {
        ...params,
    }));
    return transaction;
};
export const withCloseStakeBooster = async (transaction, connection, wallet, params) => {
    transaction.add(await closeStakeBooster(connection, wallet, {
        ...params,
    }));
    return transaction;
};
//# sourceMappingURL=transaction.js.map