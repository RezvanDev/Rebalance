import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
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
        const response = await api.get(`/user/${user.id}/balance`);
        if (response.data && typeof response.data.balance === 'number') {
          setBalance(response.data.balance);
        } else {
          console.error('Invalid balance data:', response.data);
        }
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