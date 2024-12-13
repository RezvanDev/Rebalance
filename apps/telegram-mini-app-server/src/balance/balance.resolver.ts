import * as graphql from "@nestjs/graphql";
import { BalanceResolverBase } from "./base/balance.resolver.base";
import { Balance } from "./base/Balance";
import { BalanceService } from "./balance.service";

@graphql.Resolver(() => Balance)
export class BalanceResolver extends BalanceResolverBase {
  constructor(protected readonly service: BalanceService) {
    super(service);
  }
}
