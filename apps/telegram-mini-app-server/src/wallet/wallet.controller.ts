import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { WalletService } from "./wallet.service";
import { WalletControllerBase } from "./base/wallet.controller.base";

@swagger.ApiTags("wallets")
@common.Controller("wallets")
export class WalletController extends WalletControllerBase {
  constructor(protected readonly service: WalletService) {
    super(service);
  }
}
