import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    }
  }
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    setWebApp(tg);
    tg.ready();
  }, []);

  return webApp;
}