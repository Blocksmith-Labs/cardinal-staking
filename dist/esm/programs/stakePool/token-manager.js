import { tryGetAccount, withFindOrInitAssociatedTokenAccount, } from "@cardinal/common";
import { tokenManager } from "cardinal-token-manager/dist/cjs/programs";
import { withRemainingAccountsForReturn } from "cardinal-token-manager/dist/cjs/programs/tokenManager";
import { tokenManagerAddressFromMint } from "cardinal-token-manager/dist/cjs/programs/tokenManager/pda";
export const withInvalidate = async (transaction, connection, wallet, mintId) => {
    const tokenManagerId = await tokenManagerAddressFromMint(connection, mintId);
    const tokenManagerData = await tryGetAccount(() => tokenManager.accounts.getTokenManager(connection, tokenManagerId));
    if (!tokenManagerData)
        return transaction;
    const tokenManagerTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, mintId, tokenManagerId, wallet.publicKey, true);
    const remainingAccountsForReturn = await withRemainingAccountsForReturn(transaction, connection, wallet, tokenManagerData);
    transaction.add(await tokenManager.instruction.invalidate(connection, wallet, mintId, tokenManagerId, tokenManagerData.parsed.kind, tokenManagerData.parsed.state, tokenManagerTokenAccountId, tokenManagerData === null || tokenManagerData === void 0 ? void 0 : tokenManagerData.parsed.recipientTokenAccount, remainingAccountsForReturn));
    return transaction;
};
//# sourceMappingURL=token-manager.js.map