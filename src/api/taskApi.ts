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
      console.log("Making API call to get referrals for user ID:", telegramId);
      const response = await api.get(`/user/${telegramId}/referrals`);
      console.log("API response for referrals:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching referrals:", error);
      throw error;
    }
  },
};