import { Module } from "@nestjs/common";
import { BalanceModuleBase } from "./base/balance.module.base";
import { BalanceService } from "./balance.service";
import { BalanceController } from "./balance.controller";
import { BalanceResolver } from "./balance.resolver";

@Module({
  imports: [BalanceModuleBase],
  controllers: [BalanceController],
  providers: [BalanceService, BalanceResolver],
  exports: [BalanceService],
})
export class BalanceModule {}
