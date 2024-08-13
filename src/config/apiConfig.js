const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;

export const API_URL = isTelegramWebApp
  ? 'https://f2a6-202-79-184-241.ngrok-free.app/api'
  : 'https://f2a6-202-79-184-241.ngrok-free.app/api';