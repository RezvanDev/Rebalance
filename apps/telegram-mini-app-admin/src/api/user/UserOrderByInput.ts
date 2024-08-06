import { SortOrder } from "../../util/SortOrder";

export type UserOrderByInput = {
  createdAt?: SortOrder;
  email?: SortOrder;
  firstName?: SortOrder;
  id?: SortOrder;
  lastName?: SortOrder;
  parentReferralCode?: SortOrder;
  password?: SortOrder;
  referralCode?: SortOrder;
  roles?: SortOrder;
  telegramId?: SortOrder;
  updatedAt?: SortOrder;
  username?: SortOrder;
};
