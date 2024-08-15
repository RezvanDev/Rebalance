import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import TokenTaskCard from '../card/TokenTaskCard';
import { useTransactions } from '../hooks/useTransactions';
import api from '../utils/api';
import "../styles/TokenTasks.css";

interface TokenTask {
  id: number;
  name: string;
  reward: string;
  completed: boolean;
  link: string;
  tokenAddress: string;
  requiredTokenAmount: number;
}

const TokenTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/tasks', { params: { type: 'TOKEN' } });
      if (response.data && Array.isArray(response.data.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        const tokenTasks = response.data.tasks.map((task: any) => ({
          id: task.id,
          name: task.title,
          reward: `${task.reward} LIBRA`,
          completed: completedTasks.includes(task.id),
          link: `/token-task/${task.id}`,
          tokenAddress: task.tokenAddress,
          requiredTokenAmount: task.tokenAmount
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

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCompleteTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && user && !task.completed) {
      try {
        const completeResponse = await api.post(`/tasks/${id}/complete`, { telegramId: user.id });

        if (completeResponse.data.success) {
          const rewardAmount = parseInt(task.reward.split(' ')[0]);
          
          await fetchBalance();
          
          addTransaction({
            type: 'Получение',
            amount: `${rewardAmount} LIBRA`,
            description: `Выполнение задания по токенам ${task.name}`
          });

          showMessage(`Вы получили ${task.reward} за выполнение задания ${task.name}!`);
          
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === id ? { ...t, completed: true } : t
            )
          );
          
          const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
          completedTasks.push(id);
          localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
        } else {
          showMessage(completeResponse.data.error || 'Произошла ошибка при выполнении задания.');
        }
      } catch (error: any) {
        console.error('Error completing token task:', error);
        showMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const handleRefresh = () => {
    showMessage('Обновление списка заданий по токенам...');
    fetchTokenTasks();
  };

  if (loading) {
    return <div className="loading">Загрузка заданий по токенам...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="token-tasks-container">
      {message && <div className="message">{message}</div>}
      <div className="token-tasks-header">
        <h1>Задания по токенам</h1>
        <p>Выполните задания, чтобы получить бонусы</p>
        <p>Текущий баланс: {balance} LIBRA</p>
        <button className="refresh-button" onClick={handleRefresh}>↻</button>
      </div>
      {tasks.length > 0 ? (
        <div className="token-list">
          {tasks.map((task) => (
            <TokenTaskCard
              key={task.id}
              {...task}
              onComplete={handleCompleteTask}
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