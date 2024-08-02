import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
    setTg(telegram);

    const initUser = async () => {
      if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
        const telegramUser = telegram.initDataUnsafe.user;
        try {
          const registeredUser = await api.registerUser(telegramUser.id.toString(), telegramUser.username);
          setUser(registeredUser);
        } catch (error) {
          console.error('Failed to register user:', error);
          // Fallback to local user if registration fails
          setUser({
            id: telegramUser.id,
            username: telegramUser.username,
          });
        }
      } else {
        // Fallback for development without Telegram environment
        setUser({
          id: Date.now(),
          username: 'temp_user'
        });
      }
    };

    initUser();
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