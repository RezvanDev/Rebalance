import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import api from '../utils/api';
import '../styles/TokenTaskDetail.css';

interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  channelUsername?: string;
  tokenAddress?: string;
  tokenAmount?: number;
  maxParticipants?: number;
  currentParticipants?: number;
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching task details for taskId: ${taskId}`);
      const response = await api.get(`/tasks/${taskId}`);
      console.log('Task details response:', response.data);
      if (response.data && response.data.task) {
        setTask(response.data.task);
        await checkRequirements(response.data.task);
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (error: any) {
      console.error('Error fetching task:', error);
      setError(error.response?.data?.error || error.message || 'Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/token-tasks'));
    }
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  const checkRequirements = async (task: Task) => {
    if (task.channelUsername && user) {
      const subscribed = await checkChannelSubscription(task.channelUsername);
      setIsSubscribed(subscribed);
    }
    if (task.tokenAmount) {
      const hasTokens = await checkTokenOwnership(task.tokenAmount);
      setOwnsToken(hasTokens);
    }
  };

  const checkChannelSubscription = async (channelUsername: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await api.get('/telegram/check-subscription', {
        params: { telegramId: user.id, channelUsername }
      });
      return response.data.isSubscribed;
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      return false;
    }
  };

  const checkTokenOwnership = async (requiredAmount: number): Promise<boolean> => {
    // Заглушка: предполагаем, что у пользователя всегда достаточно токенов
    return true;
  };

  const handleCompleteTask = async () => {
    if (!task || !user) return;

    try {
      const response = await api.post(`/tasks/${task.id}/complete`, { telegramId: user.id });

      if (response.data.success) {
        const rewardAmount = parseInt(task.reward.split(' ')[0]);
        
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Выполнение задания: ${task.title}`
        });

        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setTask({ ...task, completed: true });

        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(task.id);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
      } else {
        setMessage(response.data.error || 'Произошла ошибка при выполнении задания.');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      setMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка деталей задания...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={fetchTask}>Попробовать снова</button>
      </div>
    );
  }

  if (!task) {
    return <div className="error">Задание не найдено</div>;
  }

  return (
    <div className="token-task-detail">
      <h1>{task.title}</h1>
      <p className="description">{task.description}</p>
      <div className="task-info">
        <p className="reward">Награда: {task.reward}</p>
        <p className="token-amount">Требуемое количество токенов: {task.tokenAmount}</p>
        <p className="progress">Прогресс: {task.currentParticipants}/{task.maxParticipants}</p>
      </div>
      <div className="task-requirements">
        <p>Требования:</p>
        <ul>
          {task.channelUsername && (
            <li className={isSubscribed ? 'completed' : ''}>
              Подписаться на канал @{task.channelUsername}
            </li>
          )}
          {task.tokenAmount && (
            <li className={ownsToken ? 'completed' : ''}>
              Иметь {task.tokenAmount} токенов на балансе
            </li>
          )}
        </ul>
      </div>
      <button 
        className="complete-button"
        onClick={handleCompleteTask} 
        disabled={!isSubscribed || !ownsToken || task.completed}
      >
        {task.completed ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;