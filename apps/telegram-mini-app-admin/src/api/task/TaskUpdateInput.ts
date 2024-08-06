import { UserWhereUniqueInput } from "../user/UserWhereUniqueInput";

export type TaskUpdateInput = {
  reward?: number | null;
  taskType?: string | null;
  user?: UserWhereUniqueInput | null;
};
