import { WalletWhereInput } from "./WalletWhereInput";
import { WalletOrderByInput } from "./WalletOrderByInput";

export type WalletFindManyArgs = {
  where?: WalletWhereInput;
  orderBy?: Array<WalletOrderByInput>;
  skip?: number;
  take?: number;
};
