import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskApi } from '../api/taskApi';
import { useTelegram } from './TelegramContext';

interface BalanceContextType {
  balance: number;
  fetchBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const { user } = useTelegram();

  const fetchBalance = useCallback(async () => {
    if (user?.id) {
      try {
        const newBalance = await taskApi.getBalance(String(user.id));
        setBalance(newBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <BalanceContext.Provider value={{ balance, fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};