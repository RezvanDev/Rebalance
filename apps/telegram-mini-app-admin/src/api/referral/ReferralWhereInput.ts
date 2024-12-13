import { StringFilter } from "../../util/StringFilter";
import { StringNullableFilter } from "../../util/StringNullableFilter";

export type ReferralWhereInput = {
  id?: StringFilter;
  referred?: StringNullableFilter;
  referrer?: StringNullableFilter;
};
