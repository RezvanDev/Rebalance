import { useState, useEffect } from 'react';
import { useTonConnect } from './useTonConnect';
import { useTelegram } from '../context/TelegramContext';
import { api } from '../services/api';

export const useUserBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const { wallet, connected } = useTonConnect();
  const { user } = useTelegram();

  useEffect(() => {
    if (connected && wallet && user) {
      fetchBalance();
    }
  }, [connected, wallet, user]);

  const fetchBalance = async () => {
    if (user) {
      try {
        const newBalance = await api.getUserBalance(user.id.toString());
        setBalance(newBalance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    }
  };

  const addToBalance = async (amount: number) => {
    if (user) {
      try {
        const updatedUser = await api.updateUserBalance(user.id.toString(), amount);
        setBalance(updatedUser.balance);
        console.log(`Баланс увеличен на ${amount} REBA`);
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    }
  };

  const subtractFromBalance = async (amount: number) => {
    if (user && balance >= amount) {
      try {
        const updatedUser = await api.updateUserBalance(user.id.toString(), -amount);
        setBalance(updatedUser.balance);
        console.log(`Баланс уменьшен на ${amount} REBA`);
        return true;
      } catch (error) {
        console.error('Failed to update balance:', error);
        return false;
      }
    } else {
      console.log('Недостаточно средств');
      return false;
    }
  };

  return {
    balance,
    addToBalance,
    subtractFromBalance,
    fetchBalance,
  };
};