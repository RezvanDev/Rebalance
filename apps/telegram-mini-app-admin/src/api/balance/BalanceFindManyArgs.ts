import { BalanceWhereInput } from "./BalanceWhereInput";
import { BalanceOrderByInput } from "./BalanceOrderByInput";

export type BalanceFindManyArgs = {
  where?: BalanceWhereInput;
  orderBy?: Array<BalanceOrderByInput>;
  skip?: number;
  take?: number;
};
