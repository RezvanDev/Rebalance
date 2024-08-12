// src/utils/telegramUtils.ts

interface TelegramUtils {
    showAlert: (message: string) => void;
    // Добавьте здесь другие методы Telegram, которые вы используете
  }
  
  const fallbackMethods: TelegramUtils = {
    showAlert: (message: string) => {
      alert(message);
    },
    // Реализуйте здесь другие методы-заглушки
  };
  
  export const getTelegramUtils = (tg: any): TelegramUtils => {
    if (!tg) return fallbackMethods;
  
    return {
      showAlert: (message: string) => {
        if (tg.showAlert) {
          tg.showAlert(message);
        } else {
          fallbackMethods.showAlert(message);
        }
      },
      // Реализуйте здесь другие методы с проверкой наличия в tg
    };
  };