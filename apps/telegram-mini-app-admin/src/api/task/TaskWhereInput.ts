import { StringFilter } from "../../util/StringFilter";
import { IntNullableFilter } from "../../util/IntNullableFilter";
import { StringNullableFilter } from "../../util/StringNullableFilter";
import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type TaskWhereInput = {
  id?: StringFilter;
  reward?: IntNullableFilter;
  taskType?: StringNullableFilter;
  user?: UserWhereUniqueInput;
};
