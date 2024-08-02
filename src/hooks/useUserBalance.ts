import { useState, useEffect } from 'react';
import { useTonConnect } from './useTonConnect';

export const useUserBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const { wallet, connected } = useTonConnect();

  useEffect(() => {
    if (connected && wallet) {
      // Загружаем баланс из localStorage при подключении кошелька
      const savedBalance = localStorage.getItem('userBalance');
      if (savedBalance) {
        setBalance(Number(savedBalance));
      }
    }
  }, [connected, wallet]);

  const addToBalance = (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    // Сохраняем обновленный баланс в localStorage
    localStorage.setItem('userBalance', newBalance.toString());
    console.log(`Баланс увеличен на ${amount} REBA`);
  };

  const subtractFromBalance = (amount: number) => {
    if (balance >= amount) {
      const newBalance = balance - amount;
      setBalance(newBalance);
      // Сохраняем обновленный баланс в localStorage
      localStorage.setItem('userBalance', newBalance.toString());
      console.log(`Баланс уменьшен на ${amount} REBA`);
      return true;
    } else {
      console.log('Недостаточно средств');
      return false;
    }
  };

  return {
    balance,
    addToBalance,
    subtractFromBalance
  };
};