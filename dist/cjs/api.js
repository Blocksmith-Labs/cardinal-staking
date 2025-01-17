"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstakeAll = exports.unstake = exports.stakeAll = exports.stake = exports.claimRewardsAll = exports.claimRewards = exports.createStakeEntryAndStakeMint = exports.authorizeStakeEntry = exports.initializeRewardEntry = exports.createStakeEntry = exports.createRewardDistributor = exports.createStakePool = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@coral-xyz/anchor");
const mpl_token_auth_rules_1 = require("@metaplex-foundation/mpl-token-auth-rules");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const programs_1 = require("cardinal-token-manager/dist/cjs/programs");
const tokenManager_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager");
const pda_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager/pda");
const rewardDistributor_1 = require("./programs/rewardDistributor");
const accounts_1 = require("./programs/rewardDistributor/accounts");
const pda_2 = require("./programs/rewardDistributor/pda");
const transaction_1 = require("./programs/rewardDistributor/transaction");
const stakePool_1 = require("./programs/stakePool");
const accounts_2 = require("./programs/stakePool/accounts");
const pda_3 = require("./programs/stakePool/pda");
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
    const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    return [
        await (0, transaction_2.withInitStakeEntry)(new web3_js_1.Transaction(), connection, wallet, {
            stakePoolId: params.stakePoolId,
            stakeEntryId,
            originalMintId: params.originalMintId,
        }),
        stakeEntryId,
    ];
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
    const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getStakeEntry)(connection, stakeEntryId));
    const transaction = new web3_js_1.Transaction();
    if (!stakeEntryData) {
        await (0, transaction_2.withInitStakeEntry)(transaction, connection, wallet, {
            stakePoolId: params.stakePoolId,
            stakeEntryId,
            originalMintId: params.originalMintId,
        });
    }
    const rewardDistributorId = (0, pda_2.findRewardDistributorId)(params.stakePoolId);
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
const authorizeStakeEntry = (connection, wallet, params) => {
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
    const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(connection, wallet.publicKey, params.stakePoolId, params.originalMintId);
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getStakeEntry)(connection, stakeEntryId));
    if (!stakeEntryData) {
        transaction = (await (0, exports.createStakeEntry)(connection, wallet, {
            stakePoolId: params.stakePoolId,
            originalMintId: params.originalMintId,
        }))[0];
    }
    let stakeMintKeypair;
    if (!(stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMint)) {
        stakeMintKeypair = web3_js_1.Keypair.generate();
        const stakePool = await (0, accounts_2.getStakePool)(connection, params.stakePoolId);
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
    var _a, _b, _c, _d, _e, _f;
    /////// derive ids ///////
    const rewardDistributorId = (0, pda_2.findRewardDistributorId)(params.stakePoolId);
    const rewardEntryIds = params.stakeEntryIds.map((stakeEntryId) => (0, pda_2.findRewardEntryId)(rewardDistributorId, stakeEntryId));
    /////// get accounts ///////
    const rewardDistributorData = await (0, common_1.tryNull)(() => (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId));
    if (!rewardDistributorData)
        throw "No reward distributor found";
    const rewardEntryInfos = await (0, common_1.getBatchedMultipleAccounts)(connection, rewardEntryIds);
    const rewardMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(rewardDistributorData.parsed.rewardMint, (_a = params.lastStaker) !== null && _a !== void 0 ? _a : wallet.publicKey, true);
    const txs = [];
    for (let i = 0; i < params.stakeEntryIds.length; i++) {
        const stakeEntryId = params.stakeEntryIds[i];
        const rewardEntryId = rewardEntryIds[i];
        const tx = new web3_js_1.Transaction();
        /////// update seconds ///////
        await (0, transaction_2.withUpdateTotalStakeSeconds)(tx, connection, wallet, {
            stakeEntryId,
            lastStaker: wallet.publicKey,
        });
        /////// init ata ///////
        tx.add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)((_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey, rewardMintTokenAccountId, (_c = params.lastStaker) !== null && _c !== void 0 ? _c : wallet.publicKey, rewardDistributorData.parsed.rewardMint));
        /////// init entry ///////
        if (!((_d = rewardEntryInfos[i]) === null || _d === void 0 ? void 0 : _d.data)) {
            const ix = await (0, rewardDistributor_1.rewardDistributorProgram)(connection, wallet)
                .methods.initRewardEntry()
                .accounts({
                rewardEntry: rewardEntryId,
                stakeEntry: stakeEntryId,
                rewardDistributor: rewardDistributorData.pubkey,
                payer: (_e = params.payer) !== null && _e !== void 0 ? _e : wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction();
            tx.add(ix);
        }
        /////// claim rewards ///////
        const ix = await (0, rewardDistributor_1.rewardDistributorProgram)(connection, wallet)
            .methods.claimRewards()
            .accounts({
            rewardEntry: rewardEntryId,
            rewardDistributor: rewardDistributorData.pubkey,
            stakeEntry: stakeEntryId,
            stakePool: params.stakePoolId,
            rewardMint: rewardDistributorData.parsed.rewardMint,
            userRewardMintTokenAccount: rewardMintTokenAccountId,
            rewardManager: rewardDistributor_1.REWARD_MANAGER,
            user: (_f = params.payer) !== null && _f !== void 0 ? _f : wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .remainingAccounts([
            {
                pubkey: (0, spl_token_1.getAssociatedTokenAddressSync)(rewardDistributorData.parsed.rewardMint, rewardDistributorData.pubkey, true),
                isSigner: false,
                isWritable: true,
            },
        ])
            .instruction();
        tx.add(ix);
        txs.push(tx);
    }
    return txs;
};
exports.claimRewards = claimRewards;
const claimRewardsAll = async (connection, wallet, params) => {
    /////// get accounts ///////
    const rewardDistributorId = (0, pda_2.findRewardDistributorId)(params.stakePoolId);
    const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId);
    const rewardMintId = rewardDistributorData.parsed.rewardMint;
    const userRewardTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(rewardMintId, wallet.publicKey, true);
    const rewardTokenAccount = await (0, common_1.tryNull)((0, spl_token_1.getAccount)(connection, userRewardTokenAccountId));
    const txs = await (0, exports.claimRewards)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryIds: params.stakeEntryIds,
        lastStaker: params.lastStaker,
        payer: params.payer,
    });
    return !rewardTokenAccount
        ? [
            txs.slice(0, 1).map((tx) => {
                tx.instructions = [
                    (0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(wallet.publicKey, userRewardTokenAccountId, wallet.publicKey, rewardMintId),
                    ...tx.instructions,
                ];
                return { tx };
            }),
            txs.slice(1).map((tx) => ({ tx })),
        ]
        : [txs.map((tx) => ({ tx }))];
};
exports.claimRewardsAll = claimRewardsAll;
const stake = async (connection, wallet, params) => {
    var _a;
    const txSeq = await (0, exports.stakeAll)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        mintInfos: [
            {
                mintId: params.originalMintId,
                tokenAccountId: params.userOriginalMintTokenAccountId,
                receiptType: params.receiptType,
                fungible: (_a = params.fungible) !== null && _a !== void 0 ? _a : (params.amount && params.amount.gt(new anchor_1.BN(1))),
                amount: params.amount,
            },
        ],
    });
    const txs = txSeq[0];
    if (!txs)
        throw "Failed to unstake";
    const tx = txs[0];
    if (!tx)
        throw "Failed to unstake";
    return tx.tx;
};
exports.stake = stake;
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
const stakeAll = async (connection, wallet, params) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    /////// derive ids ///////
    const mintMetadataIds = params.mintInfos.map(({ mintId }) => (0, common_1.findMintMetadataId)(mintId));
    const mintInfos = params.mintInfos.map(({ mintId, fungible, ...rest }) => ({
        ...rest,
        mintId,
        fungible,
        stakeEntryId: (0, pda_3.findStakeEntryId)(wallet.publicKey, params.stakePoolId, mintId, fungible !== null && fungible !== void 0 ? fungible : false),
    }));
    /////// get accounts ///////
    const accountData = await (0, common_1.fetchAccountDataById)(connection, [
        params.stakePoolId,
        ...mintInfos.map(({ stakeEntryId }) => stakeEntryId),
        ...mintMetadataIds,
    ]);
    /////// preTxs ///////
    const preTxs = [];
    const mintInfosWithReceipts = mintInfos.filter((i) => i.receiptType === stakePool_1.ReceiptType.Receipt);
    const mintReceiptIds = {};
    if (mintInfosWithReceipts.length > 0) {
        for (let i = 0; i < mintInfosWithReceipts.length; i++) {
            const { mintId, stakeEntryId } = mintInfosWithReceipts[i];
            const transaction = new web3_js_1.Transaction();
            const stakeEntryInfo = (_a = accountData[stakeEntryId.toString()]) !== null && _a !== void 0 ? _a : null;
            const stakeEntryData = stakeEntryInfo
                ? (0, common_1.tryDecodeIdlAccount)(stakeEntryInfo, "stakeEntry", stakePool_1.STAKE_POOL_IDL)
                : null;
            const stakePoolInfo = (_b = accountData[params.stakePoolId.toString()]) !== null && _b !== void 0 ? _b : null;
            if (!stakePoolInfo)
                throw "Stake pool not found";
            const stakePoolData = (0, common_1.decodeIdlAccount)(stakePoolInfo, "stakePool", stakePool_1.STAKE_POOL_IDL);
            if (!stakeEntryInfo) {
                const ix = await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                    .methods.initEntry(wallet.publicKey)
                    .accounts({
                    stakeEntry: stakeEntryId,
                    stakePool: params.stakePoolId,
                    originalMint: mintId,
                    originalMintMetadata: (0, common_1.findMintMetadataId)(mintId),
                    payer: wallet.publicKey,
                    systemProgram: web3_js_1.SystemProgram.programId,
                })
                    .remainingAccounts((0, utils_1.remainingAccountsForInitStakeEntry)(params.stakePoolId, mintId))
                    .instruction();
                transaction.add(ix);
            }
            let stakeMintKeypair;
            if (!((_c = stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed) === null || _c === void 0 ? void 0 : _c.stakeMint)) {
                stakeMintKeypair = web3_js_1.Keypair.generate();
                await (0, transaction_2.withInitStakeMint)(transaction, connection, wallet, {
                    stakePoolId: params.stakePoolId,
                    stakeEntryId: stakeEntryId,
                    originalMintId: mintId,
                    stakeMintKeypair,
                    name: `POOl${stakePoolData.parsed.identifier.toString()} RECEIPT`,
                    symbol: `POOl${stakePoolData.parsed.identifier.toString()}`,
                });
                if (transaction.instructions.length > 0) {
                    mintReceiptIds[mintId.toString()] = stakeMintKeypair.publicKey;
                    preTxs.push({ tx: transaction, signers: [stakeMintKeypair] });
                }
            }
        }
    }
    const txs = [];
    for (let i = 0; i < mintInfos.length; i++) {
        const { mintId: originalMintId, tokenAccountId: userOriginalMintTokenAccountId, amount, receiptType, stakeEntryId, } = mintInfos[i];
        const mintMetadataId = (0, common_1.findMintMetadataId)(originalMintId);
        /////// deserialize accounts ///////
        const metadataAccountInfo = (_d = accountData[mintMetadataId.toString()]) !== null && _d !== void 0 ? _d : null;
        const mintMetadata = metadataAccountInfo
            ? mpl_token_metadata_1.Metadata.deserialize(metadataAccountInfo.data)[0]
            : null;
        const stakeEntryInfo = (_e = accountData[stakeEntryId.toString()]) !== null && _e !== void 0 ? _e : null;
        const stakeEntryData = stakeEntryInfo
            ? (0, common_1.tryDecodeIdlAccount)(stakeEntryInfo, "stakeEntry", stakePool_1.STAKE_POOL_IDL)
            : null;
        /////// start transaction ///////
        const transaction = new web3_js_1.Transaction();
        /////// init entry ///////
        if (!stakeEntryInfo) {
            const ix = await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                .methods.initEntry(wallet.publicKey)
                .accounts({
                stakeEntry: stakeEntryId,
                stakePool: params.stakePoolId,
                originalMint: originalMintId,
                originalMintMetadata: mintMetadataId,
                payer: wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .remainingAccounts((0, utils_1.remainingAccountsForInitStakeEntry)(params.stakePoolId, originalMintId))
                .instruction();
            transaction.add(ix);
        }
        if ((mintMetadata === null || mintMetadata === void 0 ? void 0 : mintMetadata.tokenStandard) === mpl_token_metadata_1.TokenStandard.ProgrammableNonFungible
        // && mintMetadata.programmableConfig?.ruleSet
        ) {
            transaction.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                units: 100000000,
            }));
            /////// programmable ///////
            transaction.add(await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                .methods.stakeProgrammable(amount !== null && amount !== void 0 ? amount : new anchor_1.BN(1))
                .accounts({
                stakeEntry: stakeEntryId,
                stakePool: params.stakePoolId,
                originalMint: originalMintId,
                systemProgram: web3_js_1.SystemProgram.programId,
                user: wallet.publicKey,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                tokenMetadataProgram: common_1.METADATA_PROGRAM_ID,
                userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
                userOriginalMintTokenRecord: (0, common_1.findTokenRecordId)(originalMintId, userOriginalMintTokenAccountId),
                mintMetadata: mintMetadataId,
                mintEdition: (0, common_1.findMintEditionId)(originalMintId),
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                authorizationRules: (_g = (_f = mintMetadata.programmableConfig) === null || _f === void 0 ? void 0 : _f.ruleSet) !== null && _g !== void 0 ? _g : common_1.METADATA_PROGRAM_ID,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
            })
                .instruction());
        }
        else {
            /////// non-programmable ///////
            const stakeEntryOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, stakeEntryId, true);
            transaction.add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(wallet.publicKey, stakeEntryOriginalMintTokenAccountId, stakeEntryId, originalMintId));
            const ix = await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                .methods.stake(amount || new anchor_1.BN(1))
                .accounts({
                stakeEntry: stakeEntryId,
                stakePool: params.stakePoolId,
                stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
                originalMint: originalMintId,
                user: wallet.publicKey,
                userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            })
                .instruction();
            transaction.add(ix);
            /////// receipts ///////
            if (receiptType && receiptType !== stakePool_1.ReceiptType.None) {
                const receiptMintId = receiptType === stakePool_1.ReceiptType.Receipt
                    ? (_h = mintReceiptIds[originalMintId.toString()]) !== null && _h !== void 0 ? _h : (_j = stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed) === null || _j === void 0 ? void 0 : _j.stakeMint
                    : originalMintId;
                if (!receiptMintId) {
                    throw "Stake entry has no receipt mint and you are trying to stake using receipts. Initialize receipt mint first.";
                }
                if (((_k = stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed) === null || _k === void 0 ? void 0 : _k.stakeMintClaimed) ||
                    ((_l = stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed) === null || _l === void 0 ? void 0 : _l.originalMintClaimed)) {
                    throw "Receipt has already been claimed.";
                }
                if (!(stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed) ||
                    stakeEntryData.parsed.amount.toNumber() === 0) {
                    const tokenManagerId = (0, pda_1.findTokenManagerAddress)(receiptMintId);
                    const tokenManagerReceiptMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(receiptMintId, tokenManagerId, true);
                    transaction.add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(wallet.publicKey, tokenManagerReceiptMintTokenAccountId, tokenManagerId, receiptMintId));
                    const ix = await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                        .methods.claimReceiptMint()
                        .accounts({
                        stakeEntry: stakeEntryId,
                        originalMint: originalMintId,
                        receiptMint: receiptMintId,
                        stakeEntryReceiptMintTokenAccount: (0, spl_token_1.getAssociatedTokenAddressSync)(receiptMintId, stakeEntryId, true),
                        user: wallet.publicKey,
                        userReceiptMintTokenAccount: (0, spl_token_1.getAssociatedTokenAddressSync)(receiptMintId, wallet.publicKey, true),
                        tokenManagerReceiptMintTokenAccount: tokenManagerReceiptMintTokenAccountId,
                        tokenManager: tokenManagerId,
                        mintCounter: (0, pda_1.findMintCounterId)(receiptMintId),
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
                        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    })
                        .remainingAccounts((0, tokenManager_1.getRemainingAccountsForKind)(receiptMintId, receiptType === stakePool_1.ReceiptType.Original
                        ? tokenManager_1.TokenManagerKind.Edition
                        : tokenManager_1.TokenManagerKind.Managed))
                        .instruction();
                    transaction.add(ix);
                }
            }
        }
        txs.push({ tx: transaction });
    }
    return preTxs.length > 0 ? [preTxs, txs] : [txs];
};
exports.stakeAll = stakeAll;
const unstake = async (connection, wallet, params) => {
    const txSeq = await (0, exports.unstakeAll)(connection, wallet, {
        stakePoolId: params.stakePoolId,
        mintInfos: [
            {
                mintId: params.originalMintId,
                fungible: params.fungible,
                stakeEntryId: params.stakeEntryId,
            },
        ],
    });
    const txs = txSeq[0];
    if (!txs)
        throw "Failed to unstake";
    const tx = txs[0];
    if (!tx)
        throw "Failed to unstake";
    return tx.tx;
};
exports.unstake = unstake;
/**
 * Convenience method to unstake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
const unstakeAll = async (connection, wallet, params) => {
    var _a, _b, _c, _d, _e;
    /////// derive ids ///////
    let mintInfos = [];
    for (const { mintId, fungible, stakeEntryId } of params.mintInfos) {
        const userOriginalMintTokenAccountId = await (0, utils_2.getTokenAddress)(connection, mintId, wallet.publicKey);
        if (!userOriginalMintTokenAccountId) {
            continue;
        }
        mintInfos.push({
            mintId,
            fungible,
            mintMetadataId: (0, common_1.findMintMetadataId)(mintId),
            userOriginalMintTokenAccountId,
            stakeEntryId: stakeEntryId !== null && stakeEntryId !== void 0 ? stakeEntryId : (0, pda_3.findStakeEntryId)(wallet.publicKey, params.stakePoolId, mintId, fungible !== null && fungible !== void 0 ? fungible : false),
        });
    }
    const rewardDistributorId = (0, pda_2.findRewardDistributorId)(params.stakePoolId);
    /////// get accounts ///////
    const accountData = await (0, common_1.fetchAccountDataById)(connection, [
        rewardDistributorId,
        params.stakePoolId,
        ...mintInfos.map(({ mintMetadataId }) => mintMetadataId),
        ...mintInfos.map(({ stakeEntryId }) => stakeEntryId),
        ...mintInfos.map(({ mintId, userOriginalMintTokenAccountId }) => (0, common_1.findTokenRecordId)(mintId, userOriginalMintTokenAccountId)),
    ]);
    const stakePoolInfo = accountData[params.stakePoolId.toString()];
    if (!(stakePoolInfo === null || stakePoolInfo === void 0 ? void 0 : stakePoolInfo.data))
        throw "Stake pool not found";
    const stakePoolData = (0, common_1.decodeIdlAccount)(stakePoolInfo, "stakePool", stakePool_1.STAKE_POOL_IDL);
    const rewardDistributorInfo = accountData[rewardDistributorId.toString()];
    const rewardDistributorData = rewardDistributorInfo
        ? (0, common_1.tryDecodeIdlAccount)(rewardDistributorInfo, "rewardDistributor", rewardDistributor_1.REWARD_DISTRIBUTOR_IDL)
        : null;
    const rewardMintId = (_a = rewardDistributorData === null || rewardDistributorData === void 0 ? void 0 : rewardDistributorData.parsed) === null || _a === void 0 ? void 0 : _a.rewardMint;
    const userRewardTokenAccountId = rewardMintId
        ? (0, spl_token_1.getAssociatedTokenAddressSync)(rewardMintId, wallet.publicKey, true)
        : null;
    const txs = [];
    for (const { mintId: originalMintId, stakeEntryId, mintMetadataId, userOriginalMintTokenAccountId, } of mintInfos) {
        /////// deserialize accounts ///////
        const metadataAccountInfo = accountData[mintMetadataId.toString()];
        const mintMetadata = metadataAccountInfo
            ? mpl_token_metadata_1.Metadata.deserialize(metadataAccountInfo.data)[0]
            : null;
        const tokenRecordInfo = accountData[(0, common_1.findTokenRecordId)(originalMintId, userOriginalMintTokenAccountId).toString()];
        const tokenRecordData = tokenRecordInfo
            ? mpl_token_metadata_1.TokenRecord.fromAccountInfo(tokenRecordInfo)[0]
            : null;
        /////// start transaction ///////
        const tx = new web3_js_1.Transaction();
        /////// init user token account ///////
        /*
        tx.add(
          createAssociatedTokenAccountIdempotentInstruction(
            wallet.publicKey,
            userOriginalMintTokenAccountId,
            wallet.publicKey,
            originalMintId
          )
        );
        */
        if ((rewardDistributorData === null || rewardDistributorData === void 0 ? void 0 : rewardDistributorData.parsed) && userRewardTokenAccountId) {
            /////// update total stake seconds ///////
            const updateIx = await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                .methods.updateTotalStakeSeconds()
                .accounts({
                stakeEntry: stakeEntryId,
                lastStaker: wallet.publicKey,
            })
                .instruction();
            tx.add(updateIx);
            /////// claim rewards ///////
            const rewardEntryId = (0, pda_2.findRewardEntryId)(rewardDistributorId, stakeEntryId);
            const rewardEntry = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardEntry)(connection, rewardEntryId));
            if (!rewardEntry) {
                const ix = await (0, rewardDistributor_1.rewardDistributorProgram)(connection, wallet)
                    .methods.initRewardEntry()
                    .accounts({
                    rewardEntry: (0, pda_2.findRewardEntryId)(rewardDistributorId, stakeEntryId),
                    rewardDistributor: rewardDistributorId,
                    stakeEntry: stakeEntryId,
                    payer: wallet.publicKey,
                    systemProgram: web3_js_1.SystemProgram.programId,
                })
                    .instruction();
                tx.add(ix);
            }
            const stakeEntryInfo = accountData[stakeEntryId.toString()];
            const stakeEntryData = (0, common_1.decodeIdlAccount)(stakeEntryInfo, "stakeEntry", stakePool_1.STAKE_POOL_IDL);
            const ix = await (0, rewardDistributor_1.rewardDistributorProgram)(connection, wallet)
                .methods.claimRewards()
                .accounts({
                rewardEntry: rewardEntryId,
                rewardDistributor: rewardDistributorId,
                stakeEntry: stakeEntryId,
                stakePool: params.stakePoolId,
                rewardMint: rewardDistributorData.parsed.rewardMint,
                userRewardMintTokenAccount: userRewardTokenAccountId,
                rewardManager: rewardDistributor_1.REWARD_MANAGER,
                user: wallet.publicKey,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .remainingAccounts([
                {
                    pubkey: (0, spl_token_1.getAssociatedTokenAddressSync)(rewardDistributorData.parsed.rewardMint, rewardDistributorId, true),
                    isSigner: false,
                    isWritable: true,
                },
            ])
                .instruction();
            if (!(rewardDistributorData.parsed.maxRewardSecondsReceived &&
                stakeEntryData.parsed.totalStakeSeconds >
                    rewardDistributorData.parsed.maxRewardSecondsReceived)) {
                tx.add(ix);
            }
        }
        if ((mintMetadata === null || mintMetadata === void 0 ? void 0 : mintMetadata.tokenStandard) === mpl_token_metadata_1.TokenStandard.ProgrammableNonFungible
            // && mintMetadata.programmableConfig?.ruleSet
            && (tokenRecordData === null || tokenRecordData === void 0 ? void 0 : tokenRecordData.delegateRole) === mpl_token_metadata_1.TokenDelegateRole.Staking) {
            /////// programmable ///////
            tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                units: 100000000,
            }));
            const ix = await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                .methods.unstakeProgrammable()
                .accounts({
                stakeEntry: stakeEntryId,
                stakePool: params.stakePoolId,
                originalMint: originalMintId,
                systemProgram: web3_js_1.SystemProgram.programId,
                user: wallet.publicKey,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                tokenMetadataProgram: common_1.METADATA_PROGRAM_ID,
                userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
                userOriginalMintTokenRecord: (0, common_1.findTokenRecordId)(originalMintId, userOriginalMintTokenAccountId),
                mintMetadata: mintMetadataId,
                mintEdition: (0, common_1.findMintEditionId)(originalMintId),
                authorizationRules: (_c = (_b = mintMetadata.programmableConfig) === null || _b === void 0 ? void 0 : _b.ruleSet) !== null && _c !== void 0 ? _c : common_1.METADATA_PROGRAM_ID,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
            })
                .instruction();
            tx.add(ix);
        }
        else {
            /////// non-programmable ///////
            const stakeEntryInfo = accountData[stakeEntryId.toString()];
            if (!stakeEntryInfo)
                throw "Stake entry not found";
            const stakeEntry = (0, common_1.decodeIdlAccount)(stakeEntryInfo, "stakeEntry", stakePool_1.STAKE_POOL_IDL);
            if (stakeEntry.parsed.stakeMintClaimed ||
                stakeEntry.parsed.originalMintClaimed) {
                /////// receipts ///////
                const receiptMint = stakeEntry.parsed.stakeMint && stakeEntry.parsed.stakeMintClaimed
                    ? stakeEntry.parsed.stakeMint
                    : stakeEntry.parsed.originalMint;
                const tokenManagerId = (0, pda_1.findTokenManagerAddress)(receiptMint);
                // todo network call in loop for token manager data
                const tokenManagerData = await (0, common_1.tryNull)(() => programs_1.tokenManager.accounts.getTokenManager(connection, tokenManagerId));
                if (tokenManagerData &&
                    (0, utils_1.shouldReturnReceipt)(stakePoolData.parsed, stakeEntry.parsed)) {
                    const remainingAccounts = await (0, tokenManager_1.withRemainingAccountsForInvalidate)(tx, connection, wallet, receiptMint, tokenManagerData, stakeEntryId, mintMetadata);
                    const ix = await (0, stakePool_1.stakePoolProgram)(connection, wallet)
                        .methods.returnReceiptMint()
                        .accounts({
                        stakeEntry: stakeEntryId,
                        receiptMint: receiptMint,
                        tokenManager: tokenManagerId,
                        tokenManagerTokenAccount: (0, spl_token_1.getAssociatedTokenAddressSync)(receiptMint, tokenManagerId, true),
                        userReceiptMintTokenAccount: (0, spl_token_1.getAssociatedTokenAddressSync)(receiptMint, wallet.publicKey, true),
                        user: wallet.publicKey,
                        collector: tokenManager_1.CRANK_KEY,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    })
                        .remainingAccounts(remainingAccounts)
                        .instruction();
                    tx.add(ix);
                }
            }
            const stakeEntryOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, stakeEntryId, true);
            const program = (0, stakePool_1.stakePoolProgram)(connection, wallet);
            if ((tokenRecordData === null || tokenRecordData === void 0 ? void 0 : tokenRecordData.delegateRole) === mpl_token_metadata_1.TokenDelegateRole.Migration) {
                const ix = await program.methods
                    .unstakeCustodialProgrammable()
                    .accounts({
                    stakePool: params.stakePoolId,
                    stakeEntry: stakeEntryId,
                    originalMint: originalMintId,
                    stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
                    user: wallet.publicKey,
                    userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
                    stakeEntryOriginalMintTokenRecord: (0, common_1.findTokenRecordId)(originalMintId, stakeEntryOriginalMintTokenAccountId),
                    userOriginalMintTokenRecord: (0, common_1.findTokenRecordId)(originalMintId, userOriginalMintTokenAccountId),
                    mintMetadata: mintMetadataId,
                    mintEdition: (0, common_1.findMintEditionId)(originalMintId),
                    authorizationRules: (_e = (_d = mintMetadata === null || mintMetadata === void 0 ? void 0 : mintMetadata.programmableConfig) === null || _d === void 0 ? void 0 : _d.ruleSet) !== null && _e !== void 0 ? _e : common_1.METADATA_PROGRAM_ID,
                    sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: common_1.METADATA_PROGRAM_ID,
                    authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                })
                    .instruction();
                tx.add(ix);
            }
            else {
                const ix = await program.methods
                    .unstake()
                    .accounts({
                    stakePool: params.stakePoolId,
                    stakeEntry: stakeEntryId,
                    originalMint: originalMintId,
                    stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
                    user: wallet.publicKey,
                    userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                })
                    .remainingAccounts(stakeEntry.parsed.stakeMint
                    ? [
                        {
                            pubkey: (0, spl_token_1.getAssociatedTokenAddressSync)(stakeEntry.parsed.stakeMint, stakeEntryId, true),
                            isSigner: false,
                            isWritable: false,
                        },
                    ]
                    : [])
                    .instruction();
                tx.add(ix);
            }
        }
        txs.push({ tx });
    }
    /////// preTxs ///////
    let rewardTokenAccount = null;
    if (userRewardTokenAccountId && rewardMintId) {
        rewardTokenAccount = await (0, common_1.tryNull)((0, spl_token_1.getAccount)(connection, userRewardTokenAccountId));
    }
    return !rewardTokenAccount && userRewardTokenAccountId && rewardMintId
        ? [
            txs.slice(0, 1).map(({ tx }) => {
                tx.instructions = [
                    (0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(wallet.publicKey, userRewardTokenAccountId, wallet.publicKey, rewardMintId),
                    ...tx.instructions,
                ];
                return { tx };
            }),
            txs.slice(1),
        ]
        : [txs];
};
exports.unstakeAll = unstakeAll;
//# sourceMappingURL=api.js.map