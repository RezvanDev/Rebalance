// BalanceContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useUserBalance } from '../hooks/useUserBalance';

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number) => Promise<void>;
  error: string | null;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { balance, addToBalance, fetchBalance, error } = useUserBalance();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const updateBalance = async (amount: number) => {
    await addToBalance(amount, true);
    await fetchBalance();
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, error }}>
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