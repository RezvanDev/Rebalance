import { BalanceListRelationFilter } from "../balance/BalanceListRelationFilter";
import { StringNullableFilter } from "../../util/StringNullableFilter";
import { StringFilter } from "../../util/StringFilter";
import { TaskListRelationFilter } from "../task/TaskListRelationFilter";
import { WalletListRelationFilter } from "../wallet/WalletListRelationFilter";

export type UserWhereInput = {
  balances?: BalanceListRelationFilter;
  email?: StringNullableFilter;
  firstName?: StringNullableFilter;
  id?: StringFilter;
  lastName?: StringNullableFilter;
  parentReferralCode?: StringNullableFilter;
  referralCode?: StringNullableFilter;
  tasks?: TaskListRelationFilter;
  telegramId?: StringNullableFilter;
  username?: StringFilter;
  wallets?: WalletListRelationFilter;
};
