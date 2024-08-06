import { Module } from "@nestjs/common";
import { WalletModuleBase } from "./base/wallet.module.base";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { WalletResolver } from "./wallet.resolver";

@Module({
  imports: [WalletModuleBase],
  controllers: [WalletController],
  providers: [WalletService, WalletResolver],
  exports: [WalletService],
})
export class WalletModule {}
