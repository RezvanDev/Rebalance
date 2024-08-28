import React, { createContext, useContext, useState, useEffect } from 'react';

interface TelegramUser {
  id: number;
  username?: string;
}

interface TelegramContextType {
  tg: any;
  user: TelegramUser | null;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const telegram = (window as any).Telegram.WebApp;
    console.log (telegram)
    setTg(telegram);
    if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
      setUser({
        id: telegram.initDataUnsafe.user.id,
        username: telegram.initDataUnsafe.user.username,
      });
    } else {
      setUser({
        id: Date.now(), 
        username: 'temp_user'
      });
    }
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