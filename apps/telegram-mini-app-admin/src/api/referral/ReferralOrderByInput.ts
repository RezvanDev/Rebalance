import { SortOrder } from "../../util/SortOrder";

export type ReferralOrderByInput = {
  createdAt?: SortOrder;
  id?: SortOrder;
  referred?: SortOrder;
  referrer?: SortOrder;
  updatedAt?: SortOrder;
};
