import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type BalanceCreateInput = {
  amount?: number | null;
  user?: UserWhereUniqueInput | null;
};
