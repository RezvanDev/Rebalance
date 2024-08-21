import { User } from "../user/User";

export type Task = {
  createdAt: Date;
  id: string;
  reward: number | null;
  taskType: string | null;
  updatedAt: Date;
  user?: User | null;
};
