import { Wallet as TWallet } from "../api/wallet/Wallet";

export const WALLET_TITLE_FIELD = "walletAddress";

export const WalletTitle = (record: TWallet): string => {
  return record.walletAddress?.toString() || String(record.id);
};
