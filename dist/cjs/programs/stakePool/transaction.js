"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCloseStakeBooster = exports.withUpdateStakeBooster = exports.withInitStakeBooster = exports.withReassignStakeEntry = exports.withCloseStakeEntry = exports.withCloseStakePool = exports.withReturnReceiptMint = exports.withUpdateTotalStakeSeconds = exports.withUpdateStakePool = exports.withUnstake = exports.withStake = exports.withClaimReceiptMint = exports.withInitStakeMint = exports.withDeauthorizeStakeEntry = exports.withAuthorizeStakeEntry = exports.withInitStakeEntry = exports.withInitStakePool = exports.withInitPoolIdentifier = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const metaplex = tslib_1.__importStar(require("@metaplex-foundation/mpl-token-metadata"));
const anchor_1 = require("@project-serum/anchor");
const programs_1 = require("cardinal-token-manager/dist/cjs/programs");
const tokenManager_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager");
const pda_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager/pda");
const utils_1 = require("../../utils");
const accounts_1 = require("../rewardDistributor/accounts");
const pda_2 = require("../rewardDistributor/pda");
const transaction_1 = require("../rewardDistributor/transaction");
const accounts_2 = require("./accounts");
const constants_1 = require("./constants");
const instruction_1 = require("./instruction");
const pda_3 = require("./pda");
const utils_2 = require("./utils");
/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
const withInitPoolIdentifier = async (transaction, connection, wallet) => {
    const [identifierId] = await (0, pda_3.findIdentifierId)();
    transaction.add((0, instruction_1.initPoolIdentifier)(connection, wallet, {
        identifierId: identifierId,
    }));
    return [transaction, identifierId];
};
exports.withInitPoolIdentifier = withInitPoolIdentifier;
const withInitStakePool = async (transaction, connection, wallet, params) => {
    const [identifierId] = await (0, pda_3.findIdentifierId)();
    const identifierData = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getPoolIdentifier)(connection));
    const identifier = (identifierData === null || identifierData === void 0 ? void 0 : identifierData.parsed.count) || new anchor_1.BN(1);
    if (!identifierData) {
        transaction.add((0, instruction_1.initPoolIdentifier)(connection, wallet, {
            identifierId: identifierId,
        }));
    }
    const [stakePoolId] = await (0, pda_3.findStakePoolId)(identifier);
    transaction.add((0, instruction_1.initStakePool)(connection, wallet, {
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
exports.withInitStakePool = withInitStakePool;
/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
const withInitStakeEntry = async (transaction, connection, wallet, params) => {
    const [[stakeEntryId], originalMintMetadatId] = await Promise.all([
        (0, utils_2.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId),
        metaplex.Metadata.getPDA(params.originalMintId),
    ]);
    transaction.add(await (0, instruction_1.initStakeEntry)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: stakeEntryId,
        originalMintId: params.originalMintId,
        originalMintMetadatId: originalMintMetadatId,
    }));
    return [transaction, stakeEntryId];
};
exports.withInitStakeEntry = withInitStakeEntry;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withAuthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    transaction.add(await (0, instruction_1.authorizeStakeEntry)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
    }));
    return transaction;
};
exports.withAuthorizeStakeEntry = withAuthorizeStakeEntry;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withDeauthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    transaction.add(await (0, instruction_1.deauthorizeStakeEntry)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
    }));
    return transaction;
};
exports.withDeauthorizeStakeEntry = withDeauthorizeStakeEntry;
/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
const withInitStakeMint = async (transaction, connection, wallet, params) => {
    const [[mintManagerId], originalMintMetadataId, stakeMintMetadataId] = await Promise.all([
        (0, pda_1.findMintManagerId)(params.stakeMintKeypair.publicKey),
        metaplex.Metadata.getPDA(params.originalMintId),
        metaplex.Metadata.getPDA(params.stakeMintKeypair.publicKey),
    ]);
    const stakeEntryStakeMintTokenAccountId = await (0, common_1.findAta)(params.stakeMintKeypair.publicKey, params.stakeEntryId, true);
    transaction.add((0, instruction_1.initStakeMint)(connection, wallet, {
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
exports.withInitStakeMint = withInitStakeMint;
/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withClaimReceiptMint = async (transaction, connection, wallet, params) => {
    if (params.receiptType === constants_1.ReceiptType.Original &&
        (await (0, utils_1.getMintSupply)(connection, params.receiptMintId)).gt(new anchor_1.BN(1))) {
        throw new Error("Fungible staking and locked reecipt type not supported yet");
    }
    const tokenManagerReceiptMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.receiptMintId, (await (0, pda_1.findTokenManagerAddress)(params.receiptMintId))[0], wallet.publicKey, true);
    transaction.add(await (0, instruction_1.claimReceiptMint)(connection, wallet, {
        stakeEntryId: params.stakeEntryId,
        tokenManagerReceiptMintTokenAccountId: tokenManagerReceiptMintTokenAccountId,
        originalMintId: params.originalMintId,
        receiptMintId: params.receiptMintId,
        receiptType: params.receiptType,
    }));
    return transaction;
};
exports.withClaimReceiptMint = withClaimReceiptMint;
/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withStake = async (transaction, connection, wallet, params) => {
    const [stakeEntryId] = await (0, utils_2.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    const stakeEntryOriginalMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    transaction.add((0, instruction_1.stake)(connection, wallet, {
        stakeEntryId: stakeEntryId,
        stakePoolId: params.stakePoolId,
        originalMint: params.originalMintId,
        stakeEntryOriginalMintTokenAccountId: stakeEntryOriginalMintTokenAccountId,
        userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
        amount: params.amount || new anchor_1.BN(1),
    }));
    return transaction;
};
exports.withStake = withStake;
/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withUnstake = async (transaction, connection, wallet, params) => {
    const [[stakeEntryId], [rewardDistributorId]] = await Promise.all([
        (0, utils_2.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId),
        await (0, pda_2.findRewardDistributorId)(params.stakePoolId),
    ]);
    const [stakeEntryData, rewardDistributorData] = await Promise.all([
        (0, common_1.tryGetAccount)(() => (0, accounts_2.getStakeEntry)(connection, stakeEntryId)),
        (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId)),
    ]);
    if (!stakeEntryData)
        throw "Stake entry not found";
    const stakePoolData = await (0, accounts_2.getStakePool)(connection, params.stakePoolId);
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
        await (0, exports.withReturnReceiptMint)(transaction, connection, wallet, {
            stakeEntryId: stakeEntryId,
        });
    }
    const stakeEntryOriginalMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    const userOriginalMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.originalMintId, wallet.publicKey, wallet.publicKey);
    const remainingAccounts = await (0, utils_2.withRemainingAccountsForUnstake)(transaction, connection, wallet, stakeEntryId, stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMint);
    transaction.add((0, instruction_1.unstake)(connection, wallet, {
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
        await (0, transaction_1.withClaimRewards)(transaction, connection, wallet, {
            stakePoolId: params.stakePoolId,
            stakeEntryId: stakeEntryId,
            lastStaker: wallet.publicKey,
            skipRewardMintTokenAccount: params.skipRewardMintTokenAccount,
        });
    }
    return transaction;
};
exports.withUnstake = withUnstake;
const withUpdateStakePool = (transaction, connection, wallet, params) => {
    transaction.add((0, instruction_1.updateStakePool)(connection, wallet, {
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
exports.withUpdateStakePool = withUpdateStakePool;
const withUpdateTotalStakeSeconds = (transaction, connection, wallet, params) => {
    transaction.add((0, instruction_1.updateTotalStakeSeconds)(connection, wallet, {
        stakEntryId: params.stakeEntryId,
        lastStaker: params.lastStaker,
    }));
    return transaction;
};
exports.withUpdateTotalStakeSeconds = withUpdateTotalStakeSeconds;
const withReturnReceiptMint = async (transaction, connection, wallet, params) => {
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getStakeEntry)(connection, params.stakeEntryId));
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
    const tokenManagerId = await (0, pda_1.tokenManagerAddressFromMint)(connection, receiptMint);
    const tokenManagerData = await (0, common_1.tryGetAccount)(() => programs_1.tokenManager.accounts.getTokenManager(connection, tokenManagerId));
    if (!tokenManagerData) {
        return transaction;
    }
    const remainingAccountsForReturn = await (0, tokenManager_1.withRemainingAccountsForReturn)(transaction, connection, wallet, tokenManagerData);
    transaction.add(await (0, instruction_1.returnReceiptMint)(connection, wallet, {
        stakeEntry: params.stakeEntryId,
        receiptMint: receiptMint,
        tokenManagerKind: tokenManagerData.parsed.kind,
        tokenManagerState: tokenManagerData.parsed.state,
        returnAccounts: remainingAccountsForReturn,
    }));
    return transaction;
};
exports.withReturnReceiptMint = withReturnReceiptMint;
const withCloseStakePool = (transaction, connection, wallet, params) => {
    transaction.add((0, instruction_1.closeStakePool)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        authority: wallet.publicKey,
    }));
    return transaction;
};
exports.withCloseStakePool = withCloseStakePool;
const withCloseStakeEntry = (transaction, connection, wallet, params) => {
    transaction.add((0, instruction_1.closeStakeEntry)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        authority: wallet.publicKey,
    }));
    return transaction;
};
exports.withCloseStakeEntry = withCloseStakeEntry;
const withReassignStakeEntry = (transaction, connection, wallet, params) => {
    transaction.add((0, instruction_1.reassignStakeEntry)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        target: params.target,
    }));
    return transaction;
};
exports.withReassignStakeEntry = withReassignStakeEntry;
const withInitStakeBooster = async (transaction, connection, wallet, params) => {
    transaction.add(await (0, instruction_1.initStakeBooster)(connection, wallet, {
        ...params,
    }));
    return transaction;
};
exports.withInitStakeBooster = withInitStakeBooster;
const withUpdateStakeBooster = async (transaction, connection, wallet, params) => {
    transaction.add(await (0, instruction_1.updateStakeBooster)(connection, wallet, {
        ...params,
    }));
    return transaction;
};
exports.withUpdateStakeBooster = withUpdateStakeBooster;
const withCloseStakeBooster = async (transaction, connection, wallet, params) => {
    transaction.add(await (0, instruction_1.closeStakeBooster)(connection, wallet, {
        ...params,
    }));
    return transaction;
};
exports.withCloseStakeBooster = withCloseStakeBooster;
//# sourceMappingURL=transaction.js.map