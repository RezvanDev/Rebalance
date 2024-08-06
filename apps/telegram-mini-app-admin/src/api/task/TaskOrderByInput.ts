import { SortOrder } from "../../util/SortOrder";

export type TaskOrderByInput = {
  createdAt?: SortOrder;
  id?: SortOrder;
  reward?: SortOrder;
  taskType?: SortOrder;
  updatedAt?: SortOrder;
  userId?: SortOrder;
};
