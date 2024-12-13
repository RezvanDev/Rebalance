import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ReferralServiceBase } from "./base/referral.service.base";

@Injectable()
export class ReferralService extends ReferralServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
