import { User } from "../user/User";

export type Wallet = {
  createdAt: Date;
  id: string;
  updatedAt: Date;
  user?: User | null;
  walletAddress: string | null;
};
