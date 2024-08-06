import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type WalletCreateInput = {
  user?: UserWhereUniqueInput | null;
  walletAddress?: string | null;
};
