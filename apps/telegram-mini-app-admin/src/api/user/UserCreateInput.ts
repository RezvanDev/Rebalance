import { BalanceCreateNestedManyWithoutUsersInput } from "./BalanceCreateNestedManyWithoutUsersInput";
import { InputJsonValue } from "../../types";
import { TaskCreateNestedManyWithoutUsersInput } from "./TaskCreateNestedManyWithoutUsersInput";
import { WalletCreateNestedManyWithoutUsersInput } from "./WalletCreateNestedManyWithoutUsersInput";

export type UserCreateInput = {
  balances?: BalanceCreateNestedManyWithoutUsersInput;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  parentReferralCode?: string | null;
  password: string;
  referralCode?: string | null;
  roles: InputJsonValue;
  tasks?: TaskCreateNestedManyWithoutUsersInput;
  telegramId?: string | null;
  username: string;
  wallets?: WalletCreateNestedManyWithoutUsersInput;
};
