import { SortOrder } from "../../util/SortOrder";

export type WalletOrderByInput = {
  createdAt?: SortOrder;
  id?: SortOrder;
  updatedAt?: SortOrder;
  userId?: SortOrder;
  walletAddress?: SortOrder;
};
