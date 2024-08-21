import api from '../utils/api';

export const taskApi = {
  getTasks: async (type: string) => {
    try {
      console.log(`Fetching tasks of type: ${type}`);
      const response = await api.get('/tasks', { params: { type } });
      console.log('Tasks response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  completeTask: async (taskId: number, telegramId: string) => {
    try {
      console.log(`Completing task ${taskId} for user ${telegramId}`);
      const response = await api.post(`/tasks/${taskId}/complete`, { telegramId });
      console.log('Task completion response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  getTaskById: async (taskId: number) => {
    try {
      console.log(`Fetching task with id: ${taskId}`);
      const response = await api.get(`/tasks/${taskId}`);
      console.log('Task response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  getBalance: async (telegramId: string) => {
    try {
      console.log(`Fetching balance for user ${telegramId}`);
      const response = await api.get(`/user/${telegramId}/balance`);
      console.log('Balance response:', response.data);
      return response.data.balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },

  updateBalance: async (userId: string, amount: number, operation: 'add' | 'subtract') => {
    try {
      console.log(`Updating balance for user ${userId}. Operation: ${operation}, Amount: ${amount}`);
      const response = await api.post(`/user/${userId}/balance`, { amount, operation });
      console.log('Balance update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  },

  // В taskApi.ts добавьте этот метод
getReferralCode: async (telegramId: string) => {
  try {
    console.log(`Fetching referral code for user ${telegramId}`);
    const response = await api.get(`/user/${telegramId}/referral-code`);
    console.log('Referral code response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching referral code:', error);
    throw error;
  }
},

  getReferrals: async (telegramId: string) => {
    try {
      console.log("Sending request for referrals. TelegramId:", telegramId);
      const response = await api.get(`/user/${telegramId}/referrals`);
      console.log("API response for referrals:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching referrals:", error);
      throw error;
    }
  },

  // Добавим новый метод для получения общего заработка от рефералов
  getTotalReferralEarnings: async (telegramId: string) => {
    try {
      console.log(`Fetching total referral earnings for user ${telegramId}`);
      const response = await api.get(`/user/${telegramId}/total-referral-earnings`);
      console.log('Total referral earnings response:', response.data);
      return response.data.totalReferralEarnings;
    } catch (error) {
      console.error('Error fetching total referral earnings:', error);
      throw error;
    }
  },

  checkChannelSubscription: async (telegramId: string, channelUsername: string) => {
    try {
      const response = await api.get('/telegram/check-subscription', {
        params: { telegramId, channelUsername }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      throw error;
    }
  },

  checkTokenBalance: async (address: string, tokenAddress: string, requiredAmount: number) => {
    try {
      const response = await api.get('/ton/check-balance', {
        params: { address, tokenAddress, requiredAmount }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking token balance:', error);
      throw error;
    }
  },

  getTokenTask: async (taskId: number) => {
    try {
      const response = await api.get(`/api/token-tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching token task:', error);
      throw error;
    }
  },

  completeTokenTask: async (taskId: number, telegramId: string) => {
    try {
      const response = await api.post(`/api/token-tasks/${taskId}/complete`, { telegramId });
      return response.data;
    } catch (error) {
      console.error('Error completing token task:', error);
      throw error;
    }
  },
};
