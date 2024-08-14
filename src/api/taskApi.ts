// api.ts или подобный файл с API-функциями

import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';

export const api = {
  getTasks: async (type: string) => {
    const response = await axios.get(`${BASE_URL}/api/tasks`, { params: { type } });
    return response.data;
  },

  completeTask: async (taskId: number, telegramId: string) => {
    const response = await axios.post(`${BASE_URL}/api/tasks/${taskId}/complete`, { telegramId });
    return response.data;
  },

  getBalance: async (telegramId: string) => {
    const response = await axios.get(`${BASE_URL}/api/user/${telegramId}/balance`);
    return response.data;
  },

  updateBalance: async (userId: string, amount: number, operation: 'add' | 'subtract') => {
    const response = await axios.post(`${BASE_URL}/api/user/${userId}/balance`, { amount, operation });
    return response.data;
  },

  getReferralCode: async (telegramId: string) => {
    const response = await axios.get(`${BASE_URL}/api/user/${telegramId}/referral-code`);
    return response.data;
  },

  getReferrals: async (telegramId: string) => {
    const response = await axios.get(`${BASE_URL}/api/user/${telegramId}/referrals`);
    return response.data;
  }
};