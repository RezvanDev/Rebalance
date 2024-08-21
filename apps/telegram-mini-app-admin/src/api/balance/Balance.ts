import { User } from "../user/User";

export type Balance = {
  amount: number | null;
  createdAt: Date;
  id: string;
  updatedAt: Date;
  user?: User | null;
};
