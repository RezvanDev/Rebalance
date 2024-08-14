// referralSystem.ts

export interface ReferralLevel {
  level: number;
  percentage: number;
}

export const referralLevels: ReferralLevel[] = [
  { level: 1, percentage: 10 },
  { level: 2, percentage: 5 },
  { level: 3, percentage: 3 },
  { level: 4, percentage: 3 },
  { level: 5, percentage: 2 },
];

export interface FormattedReferralData {
  level: number;
  percentage: number;
  count: number;
  reward: number;
}

export const formatReferralData = (
  referralsCount: number,
  referralsByLevel: { [key: number]: number },
  rewardsByLevel: { [key: number]: number }
): FormattedReferralData[] => {
  return referralLevels.map(level => ({
    level: level.level,
    percentage: level.percentage,
    count: referralsByLevel[level.level] || 0,
    reward: rewardsByLevel[level.level] || 0
  }));
};