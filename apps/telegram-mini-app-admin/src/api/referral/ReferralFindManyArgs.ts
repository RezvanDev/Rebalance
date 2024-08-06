import { ReferralWhereInput } from "./ReferralWhereInput";
import { ReferralOrderByInput } from "./ReferralOrderByInput";

export type ReferralFindManyArgs = {
  where?: ReferralWhereInput;
  orderBy?: Array<ReferralOrderByInput>;
  skip?: number;
  take?: number;
};
