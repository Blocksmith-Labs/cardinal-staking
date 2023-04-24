import { findAta } from "@cardinal/common";
import { MetadataProgram } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { CRANK_KEY, getRemainingAccountsForKind, TOKEN_MANAGER_ADDRESS, TokenManagerKind, TokenManagerState, } from "cardinal-token-manager/dist/cjs/programs/tokenManager";
import { findMintCounterId, findTokenManagerAddress, } from "cardinal-token-manager/dist/cjs/programs/tokenManager/pda";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import { ReceiptType, STAKE_BOOSTER_PAYMENT_MANAGER } from "./constants";
import { findStakeAuthorizationId, findStakeBoosterId } from "./pda";
import { remainingAccountsForInitStakeEntry } from "./utils";
export const initPoolIdentifier = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.initIdentifier({
        accounts: {
            identifier: params.identifierId,
            payer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
        },
    });
};
export const initStakePool = (connection, wallet, params) => {
    var _a, _b, _c, _d;
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
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
            systemProgram: SystemProgram.programId,
        },
    });
};
export const authorizeStakeEntry = async (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const [stakeAuthorizationId] = await findStakeAuthorizationId(params.stakePoolId, params.originalMintId);
    return stakePoolProgram.instruction.authorizeMint(params.originalMintId, {
        accounts: {
            stakePool: params.stakePoolId,
            stakeAuthorizationRecord: stakeAuthorizationId,
            payer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
        },
    });
};
export const deauthorizeStakeEntry = async (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const [stakeAuthorizationId] = await findStakeAuthorizationId(params.stakePoolId, params.originalMintId);
    return stakePoolProgram.instruction.deauthorizeMint({
        accounts: {
            stakePool: params.stakePoolId,
            stakeAuthorizationRecord: stakeAuthorizationId,
            authority: wallet.publicKey,
        },
    });
};
export const initStakeEntry = async (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const remainingAccounts = await remainingAccountsForInitStakeEntry(params.stakePoolId, params.originalMintId);
    return stakePoolProgram.instruction.initEntry(wallet.publicKey, {
        accounts: {
            stakeEntry: params.stakeEntryId,
            stakePool: params.stakePoolId,
            originalMint: params.originalMintId,
            originalMintMetadata: params.originalMintMetadatId,
            payer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
        },
        remainingAccounts,
    });
};
export const initStakeMint = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
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
            rent: SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
            associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: MetadataProgram.PUBKEY,
            systemProgram: SystemProgram.programId,
        },
    });
};
export const claimReceiptMint = async (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const [[tokenManagerId], [mintCounterId], stakeEntryReceiptMintTokenAccountId, userReceiptMintTokenAccountId, remainingAccounts,] = await Promise.all([
        findTokenManagerAddress(params.receiptMintId),
        findMintCounterId(params.receiptMintId),
        findAta(params.receiptMintId, params.stakeEntryId, true),
        findAta(params.receiptMintId, wallet.publicKey, true),
        getRemainingAccountsForKind(params.receiptMintId, params.receiptType === ReceiptType.Original
            ? TokenManagerKind.Edition
            : TokenManagerKind.Managed),
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
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
        },
        remainingAccounts,
    });
};
export const stake = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.stake(params.amount, {
        accounts: {
            stakeEntry: params.stakeEntryId,
            stakePool: params.stakePoolId,
            stakeEntryOriginalMintTokenAccount: params.stakeEntryOriginalMintTokenAccountId,
            originalMint: params.originalMint,
            user: wallet.publicKey,
            userOriginalMintTokenAccount: params.userOriginalMintTokenAccountId,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
    });
};
export const unstake = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.unstake({
        accounts: {
            stakePool: params.stakePoolId,
            stakeEntry: params.stakeEntryId,
            originalMint: params.originalMintId,
            stakeEntryOriginalMintTokenAccount: params.stakeEntryOriginalMintTokenAccount,
            user: params.user,
            userOriginalMintTokenAccount: params.userOriginalMintTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        remainingAccounts: params.remainingAccounts,
    });
};
export const updateStakePool = (connection, wallet, params) => {
    var _a, _b, _c;
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
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
export const updateTotalStakeSeconds = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.updateTotalStakeSeconds({
        accounts: {
            stakeEntry: params.stakEntryId,
            lastStaker: params.lastStaker,
        },
    });
};
export const returnReceiptMint = async (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const [tokenManagerId] = await findTokenManagerAddress(params.receiptMint);
    const tokenManagerTokenAccountId = await findAta(params.receiptMint, (await findTokenManagerAddress(params.receiptMint))[0], true);
    const userReceiptMintTokenAccount = await findAta(params.receiptMint, wallet.publicKey, true);
    const transferAccounts = await getRemainingAccountsForKind(params.receiptMint, params.tokenManagerKind);
    return stakePoolProgram.instruction.returnReceiptMint({
        accounts: {
            stakeEntry: params.stakeEntry,
            receiptMint: params.receiptMint,
            tokenManager: tokenManagerId,
            tokenManagerTokenAccount: tokenManagerTokenAccountId,
            userReceiptMintTokenAccount: userReceiptMintTokenAccount,
            user: wallet.publicKey,
            collector: CRANK_KEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
            rent: SYSVAR_RENT_PUBKEY,
        },
        remainingAccounts: [
            ...(params.tokenManagerState === TokenManagerState.Claimed
                ? transferAccounts
                : []),
            ...params.returnAccounts,
        ],
    });
};
export const closeStakePool = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.closeStakePool({
        accounts: {
            stakePool: params.stakePoolId,
            authority: params.authority,
        },
    });
};
export const closeStakeEntry = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    return stakePoolProgram.instruction.closeStakeEntry({
        accounts: {
            stakePool: params.stakePoolId,
            stakeEntry: params.stakeEntryId,
            authority: params.authority,
        },
    });
};
export const reassignStakeEntry = (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
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
export const initStakeBooster = async (connection, wallet, params) => {
    var _a, _b;
    const stakeBoosterIdentifier = (_a = params.stakeBoosterIdentifier) !== null && _a !== void 0 ? _a : new BN(0);
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const [stakeBoosterId] = await findStakeBoosterId(params.stakePoolId, params.stakeBoosterIdentifier);
    return stakePoolProgram.instruction.initStakeBooster({
        stakePool: params.stakePoolId,
        identifier: stakeBoosterIdentifier,
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        paymentManager: STAKE_BOOSTER_PAYMENT_MANAGER,
        boostSeconds: params.boostSeconds,
        startTimeSeconds: new BN(params.startTimeSeconds),
    }, {
        accounts: {
            stakePool: params.stakePoolId,
            stakeBooster: stakeBoosterId,
            authority: provider.wallet.publicKey,
            payer: (_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey,
            systemProgram: SystemProgram.programId,
        },
    });
};
export const updateStakeBooster = async (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const [stakeBoosterId] = await findStakeBoosterId(params.stakePoolId, params.stakeBoosterIdentifier);
    return stakePoolProgram.instruction.updateStakeBooster({
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        boostSeconds: params.boostSeconds,
        paymentManager: STAKE_BOOSTER_PAYMENT_MANAGER,
        startTimeSeconds: new BN(params.startTimeSeconds),
    }, {
        accounts: {
            stakePool: params.stakePoolId,
            stakeBooster: stakeBoosterId,
            authority: provider.wallet.publicKey,
        },
    });
};
export const closeStakeBooster = async (connection, wallet, params) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const stakePoolProgram = new Program(STAKE_POOL_IDL, STAKE_POOL_ADDRESS, provider);
    const [stakeBoosterId] = await findStakeBoosterId(params.stakePoolId, params.stakeBoosterIdentifier);
    return stakePoolProgram.instruction.closeStakeBooster({
        accounts: {
            stakePool: params.stakePoolId,
            stakeBooster: stakeBoosterId,
            authority: provider.wallet.publicKey,
        },
    });
};
//# sourceMappingURL=instruction.js.map