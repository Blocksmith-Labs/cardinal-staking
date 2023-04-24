"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStakeBooster = exports.getAllStakeEntries = exports.getStakePoolsByAuthority = exports.getStakeAuthorizationsForPool = exports.getStakeAuthorizations = exports.getStakeAuthorization = exports.getPoolIdentifier = exports.getStakeEntries = exports.getStakeEntry = exports.getActiveStakeEntriesForPool = exports.getAllStakeEntriesForPool = exports.getAllActiveStakeEntries = exports.getStakeEntriesForUser = exports.getAllStakePools = exports.getStakePools = exports.getStakePool = void 0;
const anchor_1 = require("@project-serum/anchor");
const solana_contrib_1 = require("@saberhq/solana-contrib");
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
const constants_1 = require("./constants");
const pda_1 = require("./pda");
const getProgram = (connection) => {
    const provider = new anchor_1.AnchorProvider(connection, new solana_contrib_1.SignerWallet(web3_js_1.Keypair.generate()), {});
    return new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
};
const getStakePool = async (connection, stakePoolId) => {
    const stakePoolProgram = getProgram(connection);
    const parsed = await stakePoolProgram.account.stakePool.fetch(stakePoolId);
    return {
        parsed,
        pubkey: stakePoolId,
    };
};
exports.getStakePool = getStakePool;
const getStakePools = async (connection, stakePoolIds) => {
    const stakePoolProgram = getProgram(connection);
    const stakePools = (await stakePoolProgram.account.stakePool.fetchMultiple(stakePoolIds));
    return stakePools.map((tm, i) => ({
        parsed: tm,
        pubkey: stakePoolIds[i],
    }));
};
exports.getStakePools = getStakePools;
const getAllStakePools = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakePool")),
                },
            },
        ],
    });
    const stakePoolDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakePoolData = coder.decode("stakePool", account.account.data);
            if (stakePoolData) {
                stakePoolDatas.push({
                    ...account,
                    parsed: stakePoolData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakePoolDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllStakePools = getAllStakePools;
const getStakeEntriesForUser = async (connection, user) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [{ memcmp: { offset: constants_1.STAKER_OFFSET, bytes: user.toBase58() } }],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
        }
        catch (e) {
            console.log(`Failed to decode token manager data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getStakeEntriesForUser = getStakeEntriesForUser;
const getAllActiveStakeEntries = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeEntry")),
                },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData &&
                stakeEntryData.lastStaker.toString() !== web3_js_1.PublicKey.default.toString()) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
        }
        catch (e) {
            // console.log(`Failed to decode stake entry data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllActiveStakeEntries = getAllActiveStakeEntries;
const getAllStakeEntriesForPool = async (connection, stakePoolId) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeEntry")),
                },
            },
            {
                memcmp: { offset: constants_1.POOL_OFFSET, bytes: stakePoolId.toBase58() },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            stakeEntryDatas.push({
                ...account,
                parsed: stakeEntryData,
            });
        }
        catch (e) {
            // console.log(`Failed to decode stake entry data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllStakeEntriesForPool = getAllStakeEntriesForPool;
const getActiveStakeEntriesForPool = async (connection, stakePoolId) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: { offset: constants_1.POOL_OFFSET, bytes: stakePoolId.toBase58() },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData &&
                stakeEntryData.lastStaker.toString() !== web3_js_1.PublicKey.default.toString()) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
        }
        catch (e) {
            // console.log(`Failed to decode token manager data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getActiveStakeEntriesForPool = getActiveStakeEntriesForPool;
const getStakeEntry = async (connection, stakeEntryId) => {
    const stakePoolProgram = getProgram(connection);
    const parsed = await stakePoolProgram.account.stakeEntry.fetch(stakeEntryId);
    return {
        parsed,
        pubkey: stakeEntryId,
    };
};
exports.getStakeEntry = getStakeEntry;
const getStakeEntries = async (connection, stakeEntryIds) => {
    const stakePoolProgram = getProgram(connection);
    const stakeEntries = (await stakePoolProgram.account.stakeEntry.fetchMultiple(stakeEntryIds));
    return stakeEntries.map((tm, i) => ({
        parsed: tm,
        pubkey: stakeEntryIds[i],
    }));
};
exports.getStakeEntries = getStakeEntries;
const getPoolIdentifier = async (connection) => {
    const stakePoolProgram = getProgram(connection);
    const [identifierId] = await (0, pda_1.findIdentifierId)();
    const parsed = await stakePoolProgram.account.identifier.fetch(identifierId);
    return {
        parsed,
        pubkey: identifierId,
    };
};
exports.getPoolIdentifier = getPoolIdentifier;
const getStakeAuthorization = async (connection, stakeAuthorizationId) => {
    const stakePoolProgram = getProgram(connection);
    const parsed = await stakePoolProgram.account.stakeAuthorizationRecord.fetch(stakeAuthorizationId);
    return {
        parsed,
        pubkey: stakeAuthorizationId,
    };
};
exports.getStakeAuthorization = getStakeAuthorization;
const getStakeAuthorizations = async (connection, stakeAuthorizationIds) => {
    const stakePoolProgram = getProgram(connection);
    const stakeAuthorizations = (await stakePoolProgram.account.stakeAuthorizationRecord.fetchMultiple(stakeAuthorizationIds));
    return stakeAuthorizations.map((data, i) => ({
        parsed: data,
        pubkey: stakeAuthorizationIds[i],
    }));
};
exports.getStakeAuthorizations = getStakeAuthorizations;
const getStakeAuthorizationsForPool = async (connection, poolId) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeAuthorizationRecord")),
                },
            },
            {
                memcmp: { offset: constants_1.POOL_OFFSET, bytes: poolId.toBase58() },
            },
        ],
    });
    const stakeAuthorizationDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const data = coder.decode("stakeAuthorizationRecord", account.account.data);
            stakeAuthorizationDatas.push({
                ...account,
                parsed: data,
            });
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakeAuthorizationDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getStakeAuthorizationsForPool = getStakeAuthorizationsForPool;
const getStakePoolsByAuthority = async (connection, user) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakePool")),
                },
            },
            {
                memcmp: {
                    offset: constants_1.AUTHORITY_OFFSET,
                    bytes: user.toBase58(),
                },
            },
        ],
    });
    const stakePoolDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakePoolData = coder.decode("stakePool", account.account.data);
            if (stakePoolData) {
                stakePoolDatas.push({
                    ...account,
                    parsed: stakePoolData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakePoolDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getStakePoolsByAuthority = getStakePoolsByAuthority;
const getAllStakeEntries = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeEntry")),
                },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllStakeEntries = getAllStakeEntries;
const getStakeBooster = async (connection, stakeBoosterId) => {
    const stakePoolProgram = getProgram(connection);
    const parsed = await stakePoolProgram.account.stakeBooster.fetch(stakeBoosterId);
    return {
        parsed,
        pubkey: stakeBoosterId,
    };
};
exports.getStakeBooster = getStakeBooster;
//# sourceMappingURL=accounts.js.map