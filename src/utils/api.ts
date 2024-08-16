import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_URL || 'https://1f46-202-79-184-241.ngrok-free.app';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

export default api;