import axios from 'axios';

// Функция для получения базового URL API
const getApiUrl = () => {
  if (import.meta.env) {
    // Для Vite
    return import.meta.env.VITE_API_URL || 'https://8d51-185-213-229-158.ngrok-free.app/api';
  } else if (window.env) {
    // Для Create React App
    return window.env.REACT_APP_API_URL || 'https://8d51-185-213-229-158.ngrok-free.app/api';
  }
  // Fallback URL
  return 'https://8d51-185-213-229-158.ngrok-free.app/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const register = (userData) => api.post('/auth/register', userData);
export const connectWallet = (data) => api.post('/auth/connect-wallet', data);
export const getUserInfo = (address) => api.get(`/auth/user-by-address/${address}`);
export const getTasks = (type) => api.get('/tasks', { params: { type } });
export const completeTask = (taskId, telegramId) => api.post(`/tasks/${taskId}/complete`, { telegramId });
export const getBalance = (telegramId) => api.get(`/users/${telegramId}/balance`);
export const updateBalance = (telegramId, data) => api.post(`/users/${telegramId}/balance`, data);
export const getReferralCode = (telegramId) => api.get(`/users/${telegramId}/referral-code`);
export const getReferrals = (telegramId) => api.get(`/users/${telegramId}/referrals`);

export default api;