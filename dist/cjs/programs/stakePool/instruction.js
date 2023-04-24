"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeStakeBooster = exports.updateStakeBooster = exports.initStakeBooster = exports.reassignStakeEntry = exports.closeStakeEntry = exports.closeStakePool = exports.returnReceiptMint = exports.updateTotalStakeSeconds = exports.updateStakePool = exports.unstake = exports.stake = exports.claimReceiptMint = exports.initStakeMint = exports.initStakeEntry = exports.deauthorizeStakeEntry = exports.authorizeStakeEntry = exports.initStakePool = exports.initPoolIdentifier = void 0;
const common_1 = require("@cardinal/common");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const tokenManager_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager");
const pda_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager/pda");
const _1 = require(".");
const constants_1 = require("./constants");
const pda_2 = require("./pda");
const utils_1 = require("./utils");
const initPoolIdentifier = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.initIdentifier({
        accounts: {
            identifier: params.identifierId,
            payer: wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
    });
};
exports.initPoolIdentifier = initPoolIdentifier;
const initStakePool = (connection, wallet, params) => {
    var _a, _b, _c, _d;
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.initPool({
        overlayText: params.overlayText,
        imageUri: params.imageUri,
        requiresCollections: params.requiresCollections,
        requiresCreators: params.requiresCreators,
        requiresAuthorization: (_a = params.requiresAuthorization) !== null && _a !== void 0 ? _a : false,
        authority: params.authority,
        resetOnStake: params.resetOnStake,
        cooldownSeconds: (_b = params.cooldownSeconds) !== null && _b !== void 0 ? _b : null,
        minStakeSeconds: (_c = params.minStakeSeconds) !== null && _c !== void 0 ? _c : null,
        endDate: (_d = params.endDate) !== null && _d !== void 0 ? _d : null,
    }, {
        accounts: {
            stakePool: params.stakePoolId,
            identifier: params.identifierId,
            payer: wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
    });
};
exports.initStakePool = initStakePool;
const authorizeStakeEntry = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const [stakeAuthorizationId] = await (0, pda_2.findStakeAuthorizationId)(params.stakePoolId, params.originalMintId);
    return stakePoolProgram.instruction.authorizeMint(params.originalMintId, {
        accounts: {
            stakePool: params.stakePoolId,
            stakeAuthorizationRecord: stakeAuthorizationId,
            payer: wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
    });
};
exports.authorizeStakeEntry = authorizeStakeEntry;
const deauthorizeStakeEntry = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const [stakeAuthorizationId] = await (0, pda_2.findStakeAuthorizationId)(params.stakePoolId, params.originalMintId);
    return stakePoolProgram.instruction.deauthorizeMint({
        accounts: {
            stakePool: params.stakePoolId,
            stakeAuthorizationRecord: stakeAuthorizationId,
            authority: wallet.publicKey,
        },
    });
};
exports.deauthorizeStakeEntry = deauthorizeStakeEntry;
const initStakeEntry = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const remainingAccounts = await (0, utils_1.remainingAccountsForInitStakeEntry)(params.stakePoolId, params.originalMintId);
    return stakePoolProgram.instruction.initEntry(wallet.publicKey, {
        accounts: {
            stakeEntry: params.stakeEntryId,
            stakePool: params.stakePoolId,
            originalMint: params.originalMintId,
            originalMintMetadata: params.originalMintMetadatId,
            payer: wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
        remainingAccounts,
    });
};
exports.initStakeEntry = initStakeEntry;
const initStakeMint = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.initStakeMint({ name: params.name, symbol: params.symbol }, {
        accounts: {
            stakeEntry: params.stakeEntryId,
            stakePool: params.stakePoolId,
            originalMint: params.originalMintId,
            originalMintMetadata: params.originalMintMetadatId,
            stakeMint: params.stakeMintId,
            stakeMintMetadata: params.stakeMintMetadataId,
            stakeEntryStakeMintTokenAccount: params.stakeEntryStakeMintTokenAccountId,
            mintManager: params.mintManagerId,
            payer: wallet.publicKey,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
            associatedToken: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: mpl_token_metadata_1.MetadataProgram.PUBKEY,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
    });
};
exports.initStakeMint = initStakeMint;
const claimReceiptMint = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const [[tokenManagerId], [mintCounterId], stakeEntryReceiptMintTokenAccountId, userReceiptMintTokenAccountId, remainingAccounts,] = await Promise.all([
        (0, pda_1.findTokenManagerAddress)(params.receiptMintId),
        (0, pda_1.findMintCounterId)(params.receiptMintId),
        (0, common_1.findAta)(params.receiptMintId, params.stakeEntryId, true),
        (0, common_1.findAta)(params.receiptMintId, wallet.publicKey, true),
        (0, tokenManager_1.getRemainingAccountsForKind)(params.receiptMintId, params.receiptType === constants_1.ReceiptType.Original
            ? tokenManager_1.TokenManagerKind.Edition
            : tokenManager_1.TokenManagerKind.Managed),
    ]);
    return stakePoolProgram.instruction.claimReceiptMint({
        accounts: {
            stakeEntry: params.stakeEntryId,
            originalMint: params.originalMintId,
            receiptMint: params.receiptMintId,
            stakeEntryReceiptMintTokenAccount: stakeEntryReceiptMintTokenAccountId,
            user: wallet.publicKey,
            userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
            mintCounter: mintCounterId,
            tokenManager: tokenManagerId,
            tokenManagerReceiptMintTokenAccount: params.tokenManagerReceiptMintTokenAccountId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
            systemProgram: web3_js_1.SystemProgram.programId,
            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
        },
        remainingAccounts,
    });
};
exports.claimReceiptMint = claimReceiptMint;
const stake = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.stake(params.amount, {
        accounts: {
            stakeEntry: params.stakeEntryId,
            stakePool: params.stakePoolId,
            stakeEntryOriginalMintTokenAccount: params.stakeEntryOriginalMintTokenAccountId,
            originalMint: params.originalMint,
            user: wallet.publicKey,
            userOriginalMintTokenAccount: params.userOriginalMintTokenAccountId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        },
    });
};
exports.stake = stake;
const unstake = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.unstake({
        accounts: {
            stakePool: params.stakePoolId,
            stakeEntry: params.stakeEntryId,
            originalMint: params.originalMintId,
            stakeEntryOriginalMintTokenAccount: params.stakeEntryOriginalMintTokenAccount,
            user: params.user,
            userOriginalMintTokenAccount: params.userOriginalMintTokenAccount,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        },
        remainingAccounts: params.remainingAccounts,
    });
};
exports.unstake = unstake;
const updateStakePool = (connection, wallet, params) => {
    var _a, _b, _c;
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.updatePool({
        overlayText: params.overlayText,
        imageUri: params.imageUri,
        requiresCollections: params.requiresCollections,
        requiresCreators: params.requiresCreators,
        requiresAuthorization: params.requiresAuthorization,
        authority: params.authority,
        resetOnStake: params.resetOnStake,
        cooldownSeconds: (_a = params.cooldownSeconds) !== null && _a !== void 0 ? _a : null,
        minStakeSeconds: (_b = params.minStakeSeconds) !== null && _b !== void 0 ? _b : null,
        endDate: (_c = params.endDate) !== null && _c !== void 0 ? _c : null,
    }, {
        accounts: {
            stakePool: params.stakePoolId,
            payer: wallet.publicKey,
        },
    });
};
exports.updateStakePool = updateStakePool;
const updateTotalStakeSeconds = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.updateTotalStakeSeconds({
        accounts: {
            stakeEntry: params.stakEntryId,
            lastStaker: params.lastStaker,
        },
    });
};
exports.updateTotalStakeSeconds = updateTotalStakeSeconds;
const returnReceiptMint = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const [tokenManagerId] = await (0, pda_1.findTokenManagerAddress)(params.receiptMint);
    const tokenManagerTokenAccountId = await (0, common_1.findAta)(params.receiptMint, (await (0, pda_1.findTokenManagerAddress)(params.receiptMint))[0], true);
    const userReceiptMintTokenAccount = await (0, common_1.findAta)(params.receiptMint, wallet.publicKey, true);
    const transferAccounts = await (0, tokenManager_1.getRemainingAccountsForKind)(params.receiptMint, params.tokenManagerKind);
    return stakePoolProgram.instruction.returnReceiptMint({
        accounts: {
            stakeEntry: params.stakeEntry,
            receiptMint: params.receiptMint,
            tokenManager: tokenManagerId,
            tokenManagerTokenAccount: tokenManagerTokenAccountId,
            userReceiptMintTokenAccount: userReceiptMintTokenAccount,
            user: wallet.publicKey,
            collector: tokenManager_1.CRANK_KEY,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
        },
        remainingAccounts: [
            ...(params.tokenManagerState === tokenManager_1.TokenManagerState.Claimed
                ? transferAccounts
                : []),
            ...params.returnAccounts,
        ],
    });
};
exports.returnReceiptMint = returnReceiptMint;
const closeStakePool = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.closeStakePool({
        accounts: {
            stakePool: params.stakePoolId,
            authority: params.authority,
        },
    });
};
exports.closeStakePool = closeStakePool;
const closeStakeEntry = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.closeStakeEntry({
        accounts: {
            stakePool: params.stakePoolId,
            stakeEntry: params.stakeEntryId,
            authority: params.authority,
        },
    });
};
exports.closeStakeEntry = closeStakeEntry;
const reassignStakeEntry = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.reasssignStakeEntry({
        target: params.target,
    }, {
        accounts: {
            stakePool: params.stakePoolId,
            stakeEntry: params.stakeEntryId,
            lastStaker: provider.wallet.publicKey,
        },
    });
};
exports.reassignStakeEntry = reassignStakeEntry;
const initStakeBooster = async (connection, wallet, params) => {
    var _a, _b;
    const stakeBoosterIdentifier = (_a = params.stakeBoosterIdentifier) !== null && _a !== void 0 ? _a : new anchor_1.BN(0);
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const [stakeBoosterId] = await (0, pda_2.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    return stakePoolProgram.instruction.initStakeBooster({
        stakePool: params.stakePoolId,
        identifier: stakeBoosterIdentifier,
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        paymentManager: constants_1.STAKE_BOOSTER_PAYMENT_MANAGER,
        boostSeconds: params.boostSeconds,
        startTimeSeconds: new anchor_1.BN(params.startTimeSeconds),
    }, {
        accounts: {
            stakePool: params.stakePoolId,
            stakeBooster: stakeBoosterId,
            authority: provider.wallet.publicKey,
            payer: (_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
    });
};
exports.initStakeBooster = initStakeBooster;
const updateStakeBooster = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const [stakeBoosterId] = await (0, pda_2.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    return stakePoolProgram.instruction.updateStakeBooster({
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        boostSeconds: params.boostSeconds,
        paymentManager: constants_1.STAKE_BOOSTER_PAYMENT_MANAGER,
        startTimeSeconds: new anchor_1.BN(params.startTimeSeconds),
    }, {
        accounts: {
            stakePool: params.stakePoolId,
            stakeBooster: stakeBoosterId,
            authority: provider.wallet.publicKey,
        },
    });
};
exports.updateStakeBooster = updateStakeBooster;
const closeStakeBooster = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const [stakeBoosterId] = await (0, pda_2.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    return stakePoolProgram.instruction.closeStakeBooster({
        accounts: {
            stakePool: params.stakePoolId,
            stakeBooster: stakeBoosterId,
            authority: provider.wallet.publicKey,
        },
    });
};
exports.closeStakeBooster = closeStakeBooster;
//# sourceMappingURL=instruction.js.map