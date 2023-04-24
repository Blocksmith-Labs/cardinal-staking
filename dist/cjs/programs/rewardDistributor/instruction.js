"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reclaimFunds = exports.updateRewardDistributor = exports.closeRewardEntry = exports.updateRewardEntry = exports.closeRewardDistributor = exports.claimRewards = exports.initRewardEntry = exports.initRewardDistributor = void 0;
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
const constants_1 = require("./constants");
const pda_1 = require("./pda");
const initRewardDistributor = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    return rewardDistributorProgram.instruction.initRewardDistributor({
        rewardAmount: params.rewardAmount,
        rewardDurationSeconds: params.rewardDurationSeconds,
        maxSupply: params.maxSupply || null,
        supply: params.supply || null,
        kind: params.kind,
        defaultMultiplier: params.defaultMultiplier || null,
        multiplierDecimals: params.multiplierDecimals || null,
        maxRewardSecondsReceived: params.maxRewardSecondsReceived || null,
    }, {
        accounts: {
            rewardDistributor: params.rewardDistributorId,
            stakePool: params.stakePoolId,
            rewardMint: params.rewardMintId,
            authority: wallet.publicKey,
            payer: wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
        remainingAccounts: params.remainingAccountsForKind,
    });
};
exports.initRewardDistributor = initRewardDistributor;
const initRewardEntry = (connection, wallet, params) => {
    var _a;
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    return rewardDistributorProgram.instruction.initRewardEntry({
        accounts: {
            rewardEntry: params.rewardEntryId,
            stakeEntry: params.stakeEntryId,
            rewardDistributor: params.rewardDistributor,
            payer: (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
    });
};
exports.initRewardEntry = initRewardEntry;
const claimRewards = async (connection, wallet, params) => {
    var _a;
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(params.stakePoolId);
    const [rewardEntryId] = await (0, pda_1.findRewardEntryId)(rewardDistributorId, params.stakeEntryId);
    return rewardDistributorProgram.instruction.claimRewards({
        accounts: {
            rewardEntry: rewardEntryId,
            rewardDistributor: rewardDistributorId,
            stakeEntry: params.stakeEntryId,
            stakePool: params.stakePoolId,
            rewardMint: params.rewardMintId,
            userRewardMintTokenAccount: params.rewardMintTokenAccountId,
            rewardManager: constants_1.REWARD_MANAGER,
            user: (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        },
        remainingAccounts: [...params.remainingAccountsForKind],
    });
};
exports.claimRewards = claimRewards;
const closeRewardDistributor = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(params.stakePoolId);
    return rewardDistributorProgram.instruction.closeRewardDistributor({
        accounts: {
            rewardDistributor: rewardDistributorId,
            stakePool: params.stakePoolId,
            rewardMint: params.rewardMintId,
            signer: wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        },
        remainingAccounts: params.remainingAccountsForKind,
    });
};
exports.closeRewardDistributor = closeRewardDistributor;
const updateRewardEntry = async (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    const [rewardDistributorId] = await (0, pda_1.findRewardDistributorId)(params.stakePoolId);
    const [rewardEntryId] = await (0, pda_1.findRewardEntryId)(rewardDistributorId, params.stakeEntryId);
    return rewardDistributorProgram.instruction.updateRewardEntry({
        multiplier: params.multiplier,
    }, {
        accounts: {
            rewardEntry: rewardEntryId,
            rewardDistributor: rewardDistributorId,
            authority: wallet.publicKey,
        },
    });
};
exports.updateRewardEntry = updateRewardEntry;
const closeRewardEntry = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    return rewardDistributorProgram.instruction.closeRewardEntry({
        accounts: {
            rewardDistributor: params.rewardDistributorId,
            rewardEntry: params.rewardEntryId,
            authority: wallet.publicKey,
        },
    });
};
exports.closeRewardEntry = closeRewardEntry;
const updateRewardDistributor = (connection, wallet, params) => {
    var _a;
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    return rewardDistributorProgram.instruction.updateRewardDistributor({
        defaultMultiplier: params.defaultMultiplier,
        multiplierDecimals: params.multiplierDecimals,
        rewardAmount: params.rewardAmount,
        rewardDurationSeconds: params.rewardDurationSeconds,
        maxRewardSecondsReceived: (_a = params.maxRewardSecondsReceived) !== null && _a !== void 0 ? _a : null,
    }, {
        accounts: {
            rewardDistributor: params.rewardDistributorId,
            authority: wallet.publicKey,
        },
    });
};
exports.updateRewardDistributor = updateRewardDistributor;
const reclaimFunds = (connection, wallet, params) => {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {});
    const rewardDistributorProgram = new anchor_1.Program(_1.REWARD_DISTRIBUTOR_IDL, _1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    return rewardDistributorProgram.instruction.reclaimFunds(params.amount, {
        accounts: {
            rewardDistributor: params.rewardDistributorId,
            rewardDistributorTokenAccount: params.rewardDistributorTokenAccountId,
            authorityTokenAccount: params.authorityTokenAccountId,
            authority: wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        },
    });
};
exports.reclaimFunds = reclaimFunds;
//# sourceMappingURL=instruction.js.map