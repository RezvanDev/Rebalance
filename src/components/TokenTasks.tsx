import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import TokenTaskCard from '../card/TokenTaskCard';
import api from '../utils/api';
import "../styles/TokenTasks.css";

interface TokenTask {
  id: number;
  title: string;
  reward: string;
  tokenAmount: number;
  completed: boolean;
}

const TokenTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { balance } = useBalance();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/tasks', { params: { type: 'TOKEN' } });
      if (response.data && Array.isArray(response.data.tasks)) {
        const tokenTasks = response.data.tasks.map((task: TokenTask) => ({
          ...task,
          completed: task.completed || false,
        }));
        setTasks(tokenTasks);
        setError(null);
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (err: any) {
      console.error('Error fetching token tasks:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке заданий по токенам');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTokenTasks();
  }, [fetchTokenTasks]);

  useEffect(() => {
    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/tasks'));
    }
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  if (loading) {
    return <div className="loading">Загрузка заданий по токенам...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="token-tasks-container">
      <div className="token-tasks-header">
        <h1>Задания по токенам</h1>
        <p>Выполните задания, чтобы получить бонусы</p>
        <p>Текущий баланс: {balance} LIBRA</p>
      </div>
      {tasks.length > 0 ? (
        <div className="token-list">
          {tasks.map((task) => (
            <TokenTaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              reward={task.reward}
              tokenAmount={task.tokenAmount}
              completed={task.completed}
            />
          ))}
        </div>
      ) : (
        <div className="no-tasks">Нет доступных заданий по токенам</div>
      )}
    </div>
  );
};

export default TokenTasks;