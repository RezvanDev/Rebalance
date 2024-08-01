import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from '../context/TelegramContext';

export const useUserBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useTelegram();

  const fetchBalance = useCallback(async () => {
    if (!user?.id) {
      setError('ID пользователя недоступен');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`);
      if (!response.ok) throw new Error('Не удалось загрузить баланс');
      const userData = await response.json();
      setBalance(userData.balance);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setError('Не удалось загрузить баланс');
    }
  }, [user]);

  const addToBalance = useCallback(async (amount: number, isTask: boolean = false) => {
    if (!user?.id) {
      setError('ID пользователя недоступен');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, isTask })
      });
      if (!response.ok) throw new Error('Не удалось обновить баланс');
      const updatedUser = await response.json();
      setBalance(updatedUser.balance);
      setError(null);
    } catch (error) {
      console.error('Failed to update balance:', error);
      setError('Не удалось обновить баланс');
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchBalance();
    }
  }, [fetchBalance, user]);

  return { balance, addToBalance, fetchBalance, error };
};