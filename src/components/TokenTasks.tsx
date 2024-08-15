import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import TokenTaskCard from '../card/TokenTaskCard';
import taskApi from '../api/taskApi';
import '../styles/TokenTasks.css';

interface TokenTask {
  id: number;
  name: string;
  reward: string;
  tokenAddress: string;
  requiredTokenAmount: number;
  completed: boolean;
}

const TokenTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { balance } = useBalance();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokenTasks();
  }, []);

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

  const fetchTokenTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks('TOKEN');
      if (response.success && Array.isArray(response.tasks)) {
        const tokenTasks = response.tasks.map((task: any) => ({
          id: task.id,
          name: task.title,
          reward: `${task.reward} LIBRA`,
          tokenAddress: task.tokenAddress,
          requiredTokenAmount: task.tokenAmount,
          completed: task.completed
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
  };

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
        <p>Текущий баланс: {balance} LIBRA</p>
      </div>
      <div className="token-list">
        {tasks.map((task) => (
          <TokenTaskCard
            key={task.id}
            id={task.id}
            name={task.name}
            reward={task.reward}
            link={`/token-task/${task.id}`}
            completed={task.completed}
          />
        ))}
      </div>
    </div>
  );
};

export default TokenTasks;