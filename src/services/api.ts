import axios from 'axios';

declare global {
  interface Window {
    _env_: {
      API_URL: string;
    };
  }
}

const API_BASE_URL = window._env_?.API_URL || 'https://bd98-202-79-184-241.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const connectWallet = async (telegramId: string, walletAddress: string) => {
  try {
    const response = await api.post('/auth/connect-wallet', { telegramId, walletAddress });
    return response.data;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getUserBalance = async (telegramId: string) => {
  try {
    const response = await api.get(`/users/${telegramId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user balance:', error);
    throw error;
  }
};

export const getReferralInfo = async (telegramId: string) => {
  try {
    const response = await api.get(`/users/${telegramId}/referrals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching referral info:', error);
    throw error;
  }
};

export default api;