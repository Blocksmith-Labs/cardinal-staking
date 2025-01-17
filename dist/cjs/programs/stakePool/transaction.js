"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withClaimStakeEntryFunds = exports.withInitUngrouping = exports.withRemoveFromGroupEntry = exports.withAddToGroupEntry = exports.withInitGroupStakeEntry = exports.withBoostStakeEntry = exports.withCloseStakeBooster = exports.withUpdateStakeBooster = exports.withInitStakeBooster = exports.withDoubleOrResetTotalStakeSeconds = exports.withReassignStakeEntry = exports.withCloseStakeEntry = exports.withCloseStakePool = exports.withUpdateTotalStakeSeconds = exports.withUpdateStakePool = exports.withInitStakeMint = exports.withDeauthorizeStakeEntry = exports.withAuthorizeStakeEntry = exports.withInitStakeEntry = exports.withInitStakePool = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@coral-xyz/anchor");
const token_1 = require("@coral-xyz/anchor/dist/cjs/utils/token");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const tokenManager_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager");
const pda_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager/pda");
const accounts_1 = require("./accounts");
const constants_1 = require("./constants");
const pda_2 = require("./pda");
const utils_1 = require("./utils");
const accounts_2 = require("cardinal-token-manager/dist/cjs/programs/paymentManager/accounts");
const paymentManager_1 = require("cardinal-token-manager/dist/cjs/programs/paymentManager");
const withInitStakePool = async (transaction, connection, wallet, params) => {
    const identifierId = (0, pda_2.findIdentifierId)();
    const identifierData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getPoolIdentifier)(connection));
    const identifier = (identifierData === null || identifierData === void 0 ? void 0 : identifierData.parsed.count) || new anchor_1.BN(1);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    if (!identifierData) {
        const ix = await program.methods
            .initIdentifier()
            .accounts({
            identifier: identifierId,
            payer: wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .instruction();
        transaction.add(ix);
    }
    const stakePoolId = (0, pda_2.findStakePoolId)(identifier);
    const ix = await program.methods
        .initPool({
        overlayText: params.overlayText || "STAKED",
        imageUri: params.imageUri || "",
        requiresCollections: params.requiresCollections || [],
        requiresCreators: params.requiresCreators || [],
        requiresAuthorization: params.requiresAuthorization || false,
        authority: wallet.publicKey,
        resetOnStake: params.resetOnStake || false,
        cooldownSeconds: params.cooldownSeconds || null,
        minStakeSeconds: params.minStakeSeconds || null,
        endDate: params.endDate || null,
        doubleOrResetEnabled: params.doubleOrResetEnabled || null,
    })
        .accounts({
        stakePool: stakePoolId,
        identifier: identifierId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
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
    const ix = await (0, constants_1.stakePoolProgram)(connection, wallet)
        .methods.initEntry(wallet.publicKey)
        .accounts({
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        originalMint: params.originalMintId,
        originalMintMetadata: (0, common_1.findMintMetadataId)(params.originalMintId),
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .remainingAccounts((0, utils_1.remainingAccountsForInitStakeEntry)(params.stakePoolId, params.originalMintId))
        .instruction();
    transaction.add(ix);
    return transaction;
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
    const ix = await (0, constants_1.stakePoolProgram)(connection, wallet)
        .methods.authorizeMint(params.originalMintId)
        .accounts({
        stakePool: params.stakePoolId,
        stakeAuthorizationRecord: (0, pda_2.findStakeAuthorizationId)(params.stakePoolId, params.originalMintId),
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
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
    const stakeAuthorizationId = (0, pda_2.findStakeAuthorizationId)(params.stakePoolId, params.originalMintId);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .deauthorizeMint()
        .accounts({
        stakePool: params.stakePoolId,
        stakeAuthorizationRecord: stakeAuthorizationId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
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
    const originalMintMetadataId = (0, common_1.findMintMetadataId)(params.originalMintId);
    const stakeMintMetadataId = (0, common_1.findMintMetadataId)(params.stakeMintKeypair.publicKey);
    const stakeEntryStakeMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(params.stakeMintKeypair.publicKey, params.stakeEntryId, true);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .initStakeMint({
        name: params.name,
        symbol: params.symbol,
    })
        .accounts({
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        originalMint: params.originalMintId,
        originalMintMetadata: originalMintMetadataId,
        stakeMint: params.stakeMintKeypair.publicKey,
        stakeMintMetadata: stakeMintMetadataId,
        stakeEntryStakeMintTokenAccount: stakeEntryStakeMintTokenAccountId,
        mintManager: (0, pda_1.findMintManagerId)(params.stakeMintKeypair.publicKey),
        payer: wallet.publicKey,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
        associatedToken: token_1.ASSOCIATED_PROGRAM_ID,
        tokenMetadataProgram: common_1.METADATA_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, params.stakeMintKeypair];
};
exports.withInitStakeMint = withInitStakeMint;
const withUpdateStakePool = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .updatePool({
        imageUri: params.imageUri || "",
        overlayText: params.overlayText || "STAKED",
        requiresCollections: params.requiresCollections || [],
        requiresCreators: params.requiresCreators || [],
        requiresAuthorization: params.requiresAuthorization || false,
        authority: wallet.publicKey,
        resetOnStake: params.resetOnStake || false,
        cooldownSeconds: params.cooldownSeconds || null,
        minStakeSeconds: params.minStakeSeconds || null,
        endDate: params.endDate || null,
        doubleOrResetEnabled: params.doubleOrResetEnabled || null,
    })
        .accounts({
        stakePool: params.stakePoolId,
        payer: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, params.stakePoolId];
};
exports.withUpdateStakePool = withUpdateStakePool;
const withUpdateTotalStakeSeconds = async (transaction, connection, wallet, params) => {
    const ix = await (0, constants_1.stakePoolProgram)(connection, wallet)
        .methods.updateTotalStakeSeconds()
        .accounts({
        stakeEntry: params.stakeEntryId,
        lastStaker: params.lastStaker,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withUpdateTotalStakeSeconds = withUpdateTotalStakeSeconds;
const withCloseStakePool = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .closeStakePool()
        .accounts({
        stakePool: params.stakePoolId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withCloseStakePool = withCloseStakePool;
const withCloseStakeEntry = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .closeStakeEntry()
        .accounts({
        stakePool: params.stakePoolId,
        stakeEntry: params.stakeEntryId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withCloseStakeEntry = withCloseStakeEntry;
const withReassignStakeEntry = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .reassignStakeEntry({ target: params.target })
        .accounts({
        stakePool: params.stakePoolId,
        stakeEntry: params.stakeEntryId,
        lastStaker: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withReassignStakeEntry = withReassignStakeEntry;
const withDoubleOrResetTotalStakeSeconds = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .doubleOrResetTotalStakeSeconds()
        .accounts({
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        lastStaker: wallet.publicKey,
        recentSlothashes: web3_js_1.SYSVAR_SLOT_HASHES_PUBKEY,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withDoubleOrResetTotalStakeSeconds = withDoubleOrResetTotalStakeSeconds;
const withInitStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = (0, pda_2.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .initStakeBooster({
        stakePool: params.stakePoolId,
        identifier: params.stakeBoosterIdentifier || new anchor_1.BN(0),
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        paymentManager: constants_1.STAKE_BOOSTER_PAYMENT_MANAGER,
        boostSeconds: params.boostSeconds,
        startTimeSeconds: new anchor_1.BN(params.startTimeSeconds),
    })
        .accounts({
        stakeBooster: stakeBoosterId,
        stakePool: params.stakePoolId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withInitStakeBooster = withInitStakeBooster;
const withUpdateStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = (0, pda_2.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .updateStakeBooster({
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        paymentManager: constants_1.STAKE_BOOSTER_PAYMENT_MANAGER,
        boostSeconds: params.boostSeconds,
        startTimeSeconds: new anchor_1.BN(params.startTimeSeconds),
    })
        .accounts({
        stakeBooster: stakeBoosterId,
        stakePool: params.stakePoolId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withUpdateStakeBooster = withUpdateStakeBooster;
const withCloseStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = (0, pda_2.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .closeStakeBooster()
        .accounts({
        stakeBooster: stakeBoosterId,
        stakePool: params.stakePoolId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withCloseStakeBooster = withCloseStakeBooster;
const withBoostStakeEntry = async (transaction, connection, wallet, params) => {
    var _a, _b;
    const stakeBoosterId = (0, pda_2.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const stakeBooster = await (0, accounts_1.getStakeBooster)(connection, stakeBoosterId);
    const paymentManager = await (0, accounts_2.getPaymentManager)(connection, stakeBooster.parsed.paymentManager);
    const feeCollectorTokenAccount = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, stakeBooster.parsed.paymentMint, paymentManager.parsed.feeCollector, (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey);
    const paymentRecipientTokenAccount = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, stakeBooster.parsed.paymentMint, stakeBooster.parsed.paymentRecipient, (_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .boostStakeEntry({ secondsToBoost: params.secondsToBoost })
        .accounts({
        stakeBooster: stakeBooster.pubkey,
        stakePool: params.stakePoolId,
        stakeEntry: params.stakeEntryId,
        originalMint: params.originalMintId,
        payerTokenAccount: params.payerTokenAccount,
        paymentRecipientTokenAccount: paymentRecipientTokenAccount,
        payer: wallet.publicKey,
        paymentManager: stakeBooster.parsed.paymentManager,
        feeCollectorTokenAccount: feeCollectorTokenAccount,
        cardinalPaymentManager: paymentManager_1.PAYMENT_MANAGER_ADDRESS,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withBoostStakeEntry = withBoostStakeEntry;
/**
 * Add init group stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withInitGroupStakeEntry = async (transaction, connection, wallet, params) => {
    const id = web3_js_1.Keypair.generate();
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const groupEntryId = (0, pda_2.findGroupEntryId)(id.publicKey);
    const ix = await program.methods
        .initGroupEntry({
        groupId: id.publicKey,
        groupCooldownSeconds: params.groupCooldownSeconds || null,
        groupStakeSeconds: params.groupStakeSeconds || null,
    })
        .accounts({
        groupEntry: groupEntryId,
        authority: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, groupEntryId];
};
exports.withInitGroupStakeEntry = withInitGroupStakeEntry;
/**
 * Add a stake entry to the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withAddToGroupEntry = async (transaction, connection, wallet, params) => {
    var _a;
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .addToGroupEntry()
        .accounts({
        groupEntry: params.groupEntryId,
        stakeEntry: params.stakeEntryId,
        authority: wallet.publicKey,
        payer: (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction];
};
exports.withAddToGroupEntry = withAddToGroupEntry;
/**
 * Remove stake entry from the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withRemoveFromGroupEntry = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .removeFromGroupEntry()
        .accounts({
        groupEntry: params.groupEntryId,
        stakeEntry: params.stakeEntryId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction];
};
exports.withRemoveFromGroupEntry = withRemoveFromGroupEntry;
/**
 * Add init ungrouping instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withInitUngrouping = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .initUngrouping()
        .accounts({
        groupEntry: params.groupEntryId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return [transaction];
};
exports.withInitUngrouping = withInitUngrouping;
const withClaimStakeEntryFunds = async (transaction, connection, wallet, stakeEntryId, fundsMintId) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getStakeEntry)(connection, stakeEntryId));
    if (!stakeEntryData) {
        throw `No stake entry id with address ${stakeEntryId.toString()}`;
    }
    const stakeEntryFundsMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(fundsMintId, stakeEntryId, true);
    const userFundsMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, fundsMintId, stakeEntryData.parsed.lastStaker, wallet.publicKey, true);
    const ix = await program.methods
        .claimStakeEntryFunds()
        .accounts({
        fundsMint: fundsMintId,
        stakeEntryFundsMintTokenAccount: stakeEntryFundsMintTokenAccountId,
        userFundsMintTokenAccount: userFundsMintTokenAccountId,
        stakePool: stakeEntryData.parsed.pool,
        stakeEntry: stakeEntryId,
        originalMint: stakeEntryData.parsed.originalMint,
        authority: wallet.publicKey,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .instruction();
    transaction.add(ix);
    return [transaction];
};
exports.withClaimStakeEntryFunds = withClaimStakeEntryFunds;
//# sourceMappingURL=transaction.js.map