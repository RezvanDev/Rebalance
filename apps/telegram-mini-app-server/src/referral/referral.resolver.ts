import * as graphql from "@nestjs/graphql";
import { ReferralResolverBase } from "./base/referral.resolver.base";
import { Referral } from "./base/Referral";
import { ReferralService } from "./referral.service";

@graphql.Resolver(() => Referral)
export class ReferralResolver extends ReferralResolverBase {
  constructor(protected readonly service: ReferralService) {
    super(service);
  }
}
