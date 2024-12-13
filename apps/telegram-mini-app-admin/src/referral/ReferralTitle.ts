import { Referral as TReferral } from "../api/referral/Referral";

export const REFERRAL_TITLE_FIELD = "referred";

export const ReferralTitle = (record: TReferral): string => {
  return record.referred?.toString() || String(record.id);
};
