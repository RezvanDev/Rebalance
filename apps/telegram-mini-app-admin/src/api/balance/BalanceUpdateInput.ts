import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type BalanceUpdateInput = {
  amount?: number | null;
  user?: UserWhereUniqueInput | null;
};
