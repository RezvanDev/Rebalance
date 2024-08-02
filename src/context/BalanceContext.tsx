// BalanceContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number) => void;
  updateChannelRewards: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const updateBalance = (amount: number) => {
    setBalance(prevBalance => prevBalance + amount);
  };

  const updateChannelRewards = (amount: number) => {
    setBalance(prevBalance => prevBalance + amount);
    // Здесь можно добавить дополнительную логику для обработки наград за каналы
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, updateChannelRewards }}>
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