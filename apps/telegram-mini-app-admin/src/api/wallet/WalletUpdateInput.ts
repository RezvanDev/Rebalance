import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type WalletUpdateInput = {
  user?: UserWhereUniqueInput | null;
  walletAddress?: string | null;
};
