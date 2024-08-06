import { BalanceUpdateManyWithoutUsersInput } from "./BalanceUpdateManyWithoutUsersInput";
import { InputJsonValue } from "../../types";
import { TaskUpdateManyWithoutUsersInput } from "./TaskUpdateManyWithoutUsersInput";
import { WalletUpdateManyWithoutUsersInput } from "./WalletUpdateManyWithoutUsersInput";

export type UserUpdateInput = {
  balances?: BalanceUpdateManyWithoutUsersInput;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  parentReferralCode?: string | null;
  password?: string;
  referralCode?: string | null;
  roles?: InputJsonValue;
  tasks?: TaskUpdateManyWithoutUsersInput;
  telegramId?: string | null;
  username?: string;
  wallets?: WalletUpdateManyWithoutUsersInput;
};
