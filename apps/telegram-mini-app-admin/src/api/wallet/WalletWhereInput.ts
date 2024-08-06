import { StringFilter } from "../../util/StringFilter";
import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";
import { StringNullableFilter } from "../../util/StringNullableFilter";

export type WalletWhereInput = {
  id?: StringFilter;
  user?: UserWhereUniqueInput;
  walletAddress?: StringNullableFilter;
};
