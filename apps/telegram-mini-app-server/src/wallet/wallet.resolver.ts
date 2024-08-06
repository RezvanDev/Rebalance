import * as graphql from "@nestjs/graphql";
import { WalletResolverBase } from "./base/wallet.resolver.base";
import { Wallet } from "./base/Wallet";
import { WalletService } from "./wallet.service";

@graphql.Resolver(() => Wallet)
export class WalletResolver extends WalletResolverBase {
  constructor(protected readonly service: WalletService) {
    super(service);
  }
}
