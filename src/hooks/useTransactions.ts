import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { api } from '../services/api';

interface Transaction {
  id: string;
  type: 'Получение' | 'Вывод';
  amount: string;
  date: string;
  description: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useTelegram();

  const loadTransactions = useCallback(async () => {
    if (user) {
      try {
        const fetchedTransactions = await api.getTransactions(user.id.toString());
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    if (user) {
      try {
        const addedTransaction = await api.addTransaction(user.id.toString(), newTransaction);
        setTransactions(prevTransactions => [addedTransaction, ...prevTransactions]);
      } catch (error) {
        console.error('Failed to add transaction:', error);
      }
    }
  }, [user]);

  return { transactions, addTransaction, loadTransactions };
};