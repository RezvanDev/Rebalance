import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { ReferralService } from "./referral.service";
import { ReferralControllerBase } from "./base/referral.controller.base";

@swagger.ApiTags("referrals")
@common.Controller("referrals")
export class ReferralController extends ReferralControllerBase {
  constructor(protected readonly service: ReferralService) {
    super(service);
  }
}
