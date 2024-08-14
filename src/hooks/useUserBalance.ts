import { useState, useEffect } from 'react';
import { useTonConnect } from './useTonConnect';

export const useUserBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const { wallet, connected } = useTonConnect();

  useEffect(() => {
    if (connected && wallet) {
      const savedBalance = localStorage.getItem('userBalance');
      if (savedBalance) {
        setBalance(Number(savedBalance));
      }
    }
  }, [connected, wallet]);

  const addToBalance = (amount: number) => {
    setBalance(prevBalance => {
      const newBalance = prevBalance + amount;
      localStorage.setItem('userBalance', newBalance.toString());
      console.log(`Баланс увеличен на ${amount} REBA`);
      return newBalance;
    });
  };

  const subtractFromBalance = (amount: number) => {
    return setBalance(prevBalance => {
      if (prevBalance >= amount) {
        const newBalance = prevBalance - amount;
        localStorage.setItem('userBalance', newBalance.toString());
        console.log(`Баланс уменьшен на ${amount} REBA`);
        return newBalance;
      } else {
        console.log('Недостаточно средств');
        return prevBalance;
      }
    });
  };

  return {
    balance,
    addToBalance,
    subtractFromBalance
  };
};