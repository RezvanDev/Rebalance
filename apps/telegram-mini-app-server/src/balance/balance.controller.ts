import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { BalanceService } from "./balance.service";
import { BalanceControllerBase } from "./base/balance.controller.base";

@swagger.ApiTags("balances")
@common.Controller("balances")
export class BalanceController extends BalanceControllerBase {
  constructor(protected readonly service: BalanceService) {
    super(service);
  }
}
