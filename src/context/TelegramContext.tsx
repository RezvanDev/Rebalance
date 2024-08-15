import React, { createContext, useContext, useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';

interface TelegramUser {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  walletAddress?: string;
  balance: number;
  totalEarned: number;
  totalReferralEarnings: number;
}

interface TelegramContextType {
  tg: any;
  user: TelegramUser | null;
  setUser: React.Dispatch<React.SetStateAction<TelegramUser | null>>;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const telegram = (window as any).Telegram.WebApp;
    console.log('Telegram WebApp:', telegram);
    setTg(telegram);

    const fetchUserData = async () => {
      if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
        const telegramId = telegram.initDataUnsafe.user.id.toString();
        try {
          const userData = await taskApi.getUserInfo(telegramId);
          if (userData.success) {
            setUser(userData.user);
          } else {
            console.error('Failed to fetch user data:', userData.error);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.warn('No Telegram user data available');
        // Если мы не можем получить пользователя из Telegram, создадим временного пользователя
        setUser({
          id: Date.now(),
          telegramId: Date.now().toString(),
          username: 'temp_user',
          balance: 0,
          totalEarned: 0,
          totalReferralEarnings: 0,
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <TelegramContext.Provider value={{ tg, user, setUser }}>
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