import React, { createContext, useContext } from 'react';
import { useBalance } from '../hooks/useBalance';

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number, operation: 'add' | 'subtract') => Promise<void>;
  fetchBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { balance, updateBalance, fetchBalance } = useBalance();

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalanceContext = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalanceContext must be used within a BalanceProvider');
  }
  return context;
};