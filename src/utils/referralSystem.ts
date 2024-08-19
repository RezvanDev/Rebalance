interface ReferralLevel {
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
  
  export const calculateReferralReward = (amount: number, level: number): number => {
    const referralLevel = referralLevels.find(r => r.level === level);
    if (referralLevel) {
      return (amount * referralLevel.percentage) / 100;
    }
    return 0;
  };
  
  export const distributeReferralRewards = async (userId: string, amount: number) => {
    let currentUserId = userId;
    for (let i = 0; i < referralLevels.length; i++) {
      const referrer = await getReferrer(currentUserId);
      if (referrer) {
        const reward = calculateReferralReward(amount, i + 1);
        console.log(`Уровень ${i + 1}: Реферал ${referrer} получает ${reward} REBA`);
        // Здесь должна быть логика начисления награды рефералу
        currentUserId = referrer;
      } else {
        break;
      }
    }
  };
  
  const getReferrer = async (userId: string): Promise<string | null> => {
    // Здесь должна быть реальная логика получения реферала из базы данных или смарт-контракта
    return Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 1000)}` : null;
  };