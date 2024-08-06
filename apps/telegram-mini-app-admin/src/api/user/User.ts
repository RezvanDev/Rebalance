import { Balance } from "../balance/Balance";
import { JsonValue } from "type-fest";
import { Task } from "../task/Task";
import { Wallet } from "../wallet/Wallet";

export type User = {
  balances?: Array<Balance>;
  createdAt: Date;
  email: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
  parentReferralCode: string | null;
  referralCode: string | null;
  roles: JsonValue;
  tasks?: Array<Task>;
  telegramId: string | null;
  updatedAt: Date;
  username: string;
  wallets?: Array<Wallet>;
};
