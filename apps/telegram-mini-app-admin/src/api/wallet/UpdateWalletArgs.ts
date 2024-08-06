import { WalletWhereUniqueInput } from "./WalletWhereUniqueInput";
import { WalletUpdateInput } from "./WalletUpdateInput";

export type UpdateWalletArgs = {
  where: WalletWhereUniqueInput;
  data: WalletUpdateInput;
};
