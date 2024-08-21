import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BalanceServiceBase } from "./base/balance.service.base";

@Injectable()
export class BalanceService extends BalanceServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
