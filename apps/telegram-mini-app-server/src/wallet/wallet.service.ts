import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WalletServiceBase } from "./base/wallet.service.base";

@Injectable()
export class WalletService extends WalletServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
