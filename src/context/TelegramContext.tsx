import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramContextType {
  tg: any;
  user: any;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const telegram = (window as any).Telegram.WebApp;
    setTg(telegram);
    setUser(telegram.initDataUnsafe?.user);
    telegram.ready();
  }, []);

  return (
    <TelegramContext.Provider value={{ tg, user }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};