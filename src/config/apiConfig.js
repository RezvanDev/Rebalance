const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;

export const API_URL = isTelegramWebApp
  ? 'https://chipper-taffy-f2a652.netlify.app'
  : 'https://chipper-taffy-f2a652.netlify.app/';