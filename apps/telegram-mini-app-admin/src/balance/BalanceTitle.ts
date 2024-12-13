import { Balance as TBalance } from "../api/balance/Balance";

export const BALANCE_TITLE_FIELD = "id";

export const BalanceTitle = (record: TBalance): string => {
  return record.id?.toString() || String(record.id);
};
