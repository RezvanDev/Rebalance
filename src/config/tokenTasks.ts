export interface TokenTask {
    id: number;
    name: string;
    description: string;
    reward: string;
    maxParticipants: number;
    channelLink: string;
    requiredTokenAmount: number;
    tokenAddress: string;
  }
  
  export const tokenTasks: TokenTask[] = [
    {
      id: 1,
      name: 'REBA Task',
      description: 'Ознакомтесь с токеном REBA и получите вознаграждение. Не продавайте токены до аирдропа, иначе не получите награду',
      reward: '100 REBA',
      maxParticipants: 100,
      channelLink: 'https://t.me/rebalancer',
      requiredTokenAmount: 5000,
      tokenAddress: '0x123...', // Адрес смарт-контракта REBA
    },
    {
      id: 2,
      name: 'HYDRA Task',
      description: 'Участвуйте в задании HYDRA и получите награду',
      reward: '50 HYDRA',
      maxParticipants: 200,
      channelLink: 'https://t.me/hydrachain',
      requiredTokenAmount: 1000,
      tokenAddress: '0x456...', // Адрес смарт-контракта HYDRA
    },
    // Добавьте здесь другие задания
  ];