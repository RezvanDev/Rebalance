
interface TelegramUtils {
    showAlert: (message: string) => void;

  }
  
  const fallbackMethods: TelegramUtils = {
    showAlert: (message: string) => {
      alert(message);
    },
    
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
      
    };
  };