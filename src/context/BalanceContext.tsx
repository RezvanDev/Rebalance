import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTelegram } from '../context/TelegramContext';
import { BASE_URL } from '../constants/baseUrl';

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number, operation: 'add' | 'subtract') => Promise<void>;
  fetchBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const { user } = useTelegram();

  const fetchBalance = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await axios.get(`${BASE_URL}/api/user/${user.id}/balance`);
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const updateBalance = async (amount: number, operation: 'add' | 'subtract') => {
    if (user?.id) {
      try {
        const response = await axios.post(`${BASE_URL}/api/user/${user.id}/balance`, null, {
          params: { amount, operation }
        });
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
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