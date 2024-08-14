import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useTelegram } from './TelegramContext';

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number, operation: 'add' | 'subtract') => Promise<number | null>;
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
        console.log('Fetched balance:', response.data);
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

  const updateBalance = async (amount: number, operation: 'add' | 'subtract'): Promise<number | null> => {
    if (user?.id) {
      try {
        const response = await api.post(`/user/${user.id}/balance`, null, {
          params: { amount, operation }
        });
        console.log('Updated balance:', response.data);
        if (response.data && typeof response.data.balance === 'number') {
          setBalance(response.data.balance);
          return response.data.balance;
        } else {
          console.error('Invalid balance data:', response.data);
          return null;
        }
      } catch (error) {
        console.error('Error updating balance:', error);
        throw error;
      }
    }
    return null;
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, fetchBalance }}>
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