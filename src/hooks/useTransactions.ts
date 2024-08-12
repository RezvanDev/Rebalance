// src/hooks/useTransactions.ts
import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from '../context/TelegramContext';

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

  const loadTransactions = useCallback(() => {
    if (user) {
      const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    }
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setTransactions(prevTransactions => {
      const updatedTransactions = [transaction, ...prevTransactions];
      if (user) {
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
      }
      return updatedTransactions;
    });
  }, [user]);

  return { transactions, addTransaction, loadTransactions };
};