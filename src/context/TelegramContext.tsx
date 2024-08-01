import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

interface TelegramContextType {
  tg: any;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const telegram = (window as any).Telegram.WebApp;
    setTg(telegram);

    const registerUser = async () => {
      if (telegram.initDataUnsafe?.user) {
        const { id, username } = telegram.initDataUnsafe.user;
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: id.toString(), username })
          });
          if (!response.ok) throw new Error('Ошибка при регистрации');
          const data = await response.json();
          setUser({ id: data.user.telegramId, username: data.user.username });
          if (data.message === 'Регистрация успешна') {
            alert('Вы успешно зарегистрировались!');
          }
        } catch (err) {
          setError('Не удалось зарегистрировать пользователя');
        }
      } else {
        setError('Не удалось получить данные пользователя');
      }
      setIsLoading(false);
    };

    registerUser();
    telegram.ready();
  }, []);

  return (
    <TelegramContext.Provider value={{ tg, user, isLoading, error }}>
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