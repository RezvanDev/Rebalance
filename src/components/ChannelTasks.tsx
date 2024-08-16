import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import UniversalTaskCard from './UniversalTaskCard';
import { useTransactions } from '../hooks/useTransactions';
import { taskApi } from '../api/taskApi';
import "../styles/ChannelTasks.css";

interface Task {
  id: number;
  title: string;
  reward: string;
  completed: boolean;
  channelUsername: string;
  type: 'CHANNEL';
}

const ChannelTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannelTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await taskApi.getTasks('CHANNEL');
      if (response && Array.isArray(response.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        const channelTasks = response.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          reward: `${task.reward} LIBRA`,
          completed: completedTasks.includes(task.id),
          channelUsername: task.channelUsername,
          type: 'CHANNEL' as const
        }));
        setTasks(channelTasks);
        setError(null);
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (err: any) {
      console.error('Error fetching channel tasks:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке заданий по каналам');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChannelTasks();
  }, [fetchChannelTasks]);

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

  const handleSubscribe = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && user && !task.completed) {
      try {
        const completeResponse = await taskApi.completeTask(id, user.id);

        if (completeResponse.success) {
          const rewardAmount = parseInt(task.reward.split(' ')[0]);
          
          await fetchBalance();
          
          addTransaction({
            type: 'Получение',
            amount: `${rewardAmount} LIBRA`,
            description: `Подписка на канал ${task.title}`
          });

          showMessage(`Вы получили ${task.reward} за подписку на ${task.title}!`);
          
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === id ? { ...t, completed: true } : t
            )
          );
          
          const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
          completedTasks.push(id);
          localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
        } else {
          showMessage(completeResponse.error || 'Произошла ошибка при выполнении задания.');
        }
      } catch (error: any) {
        console.error('Error completing channel task:', error);
        showMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const handleRefresh = () => {
    showMessage('Обновление списка каналов...');
    fetchChannelTasks();
  };

  if (loading) {
    return <div className="loading">Загрузка заданий по каналам...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="channel-tasks-container">
      {message && <div className="message">{message}</div>}
      <div className="channel-tasks-header">
        <h1>Задания по каналам</h1>
        <p>Подпишитесь на каналы, чтобы получить бонусы</p>
        <p>Текущий баланс: {balance} LIBRA</p>
        <button className="refresh-button" onClick={handleRefresh}>↻</button>
      </div>
      {tasks.length > 0 ? (
        <div className="channel-list">
          {tasks.map((task) => (
            <UniversalTaskCard
              key={task.id}
              {...task}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      ) : (
        <div className="no-tasks">Нет доступных заданий по каналам</div>
      )}
    </div>
  );
};

export default ChannelTasks;