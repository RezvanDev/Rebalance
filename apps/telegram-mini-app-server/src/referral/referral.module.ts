import { Module } from "@nestjs/common";
import { ReferralModuleBase } from "./base/referral.module.base";
import { ReferralService } from "./referral.service";
import { ReferralController } from "./referral.controller";
import { ReferralResolver } from "./referral.resolver";

@Module({
  imports: [ReferralModuleBase],
  controllers: [ReferralController],
  providers: [ReferralService, ReferralResolver],
  exports: [ReferralService],
})
export class ReferralModule {}
