import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type TaskCreateInput = {
  reward?: number | null;
  taskType?: string | null;
  user?: UserWhereUniqueInput | null;
};
