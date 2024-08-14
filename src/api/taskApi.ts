import api from '../utils/api';

export const taskApi = {
  getTasks: async (type: string) => {
    try {
      const response = await api.get('/tasks', { params: { type } });
      console.log('Tasks response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  completeTask: async (taskId: number, telegramId: string) => {
    const response = await api.post(`/tasks/${taskId}/complete`, { telegramId });
    return response.data;
  },
  getBalance: async (telegramId: string) => {
    try {
      const response = await api.get(`/user/${telegramId}/balance`);
      console.log('Balance response:', response.data);
      return response.data.balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },
  updateBalance: async (userId: string, amount: number, operation: 'add' | 'subtract') => {
    const response = await api.post(`/user/${userId}/balance`, { amount, operation });
    return response.data;
  },
  getReferralCode: async (telegramId: string) => {
    const response = await api.get(`/user/${telegramId}/referral-code`);
    return response.data;
  },
  getReferrals: async (telegramId: string) => {
    const response = await api.get(`/user/${telegramId}/referrals`);
    return response.data;
  }
};