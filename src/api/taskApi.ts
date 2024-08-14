import api from '../utils/api';

export const taskApi = {
  getTasks: async (type: string) => {
    const response = await api.get('/tasks', { params: { type } });
    return response.data;
  },
  completeTask: async (taskId: number, telegramId: string) => {
    const response = await api.post(`/tasks/${taskId}/complete`, { telegramId });
    return response.data;
  },
  getBalance: async (telegramId: string) => {
    const response = await api.get(`/user/${telegramId}/balance`);
    return response.data.balance; // Предполагаем, что сервер возвращает { balance: number }
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