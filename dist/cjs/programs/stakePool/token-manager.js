"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withInvalidate = void 0;
const common_1 = require("@cardinal/common");
const programs_1 = require("cardinal-token-manager/dist/cjs/programs");
const tokenManager_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager");
const pda_1 = require("cardinal-token-manager/dist/cjs/programs/tokenManager/pda");
const withInvalidate = async (transaction, connection, wallet, mintId) => {
    const tokenManagerId = await (0, pda_1.tokenManagerAddressFromMint)(connection, mintId);
    const tokenManagerData = await (0, common_1.tryGetAccount)(() => programs_1.tokenManager.accounts.getTokenManager(connection, tokenManagerId));
    if (!tokenManagerData)
        return transaction;
    const tokenManagerTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, mintId, tokenManagerId, wallet.publicKey, true);
    const remainingAccountsForReturn = await (0, tokenManager_1.withRemainingAccountsForReturn)(transaction, connection, wallet, tokenManagerData);
    transaction.add(await programs_1.tokenManager.instruction.invalidate(connection, wallet, mintId, tokenManagerId, tokenManagerData.parsed.kind, tokenManagerData.parsed.state, tokenManagerTokenAccountId, tokenManagerData === null || tokenManagerData === void 0 ? void 0 : tokenManagerData.parsed.recipientTokenAccount, remainingAccountsForReturn));
    return transaction;
};
exports.withInvalidate = withInvalidate;
//# sourceMappingURL=token-manager.js.map