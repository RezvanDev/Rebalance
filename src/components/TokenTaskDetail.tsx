import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { taskApi } from '../api/taskApi';
import UniversalTaskCard from './UniversalTaskCard';
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
  type: 'TOKEN';
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
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
      const response = await taskApi.getTasks('TOKEN');
      const tokenTask = response.tasks.find((t: Task) => t.id === parseInt(taskId));
      if (tokenTask) {
        setTask(tokenTask);
        await checkRequirements(tokenTask);
      } else {
        throw new Error('Задание не найдено');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Ошибка при загрузке задания');
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
      tg.BackButton.onClick(() => navigate('/tasks'));
    }
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  const checkRequirements = async (task: Task) => {
    if (!user) return;
    
    if (task.channelUsername) {
      const subscribed = await checkChannelSubscription(task.channelUsername);
      setIsSubscribed(subscribed);
    }
    if (task.tokenAddress && task.tokenAmount) {
      const hasTokens = await checkTokenOwnership(task.tokenAddress, task.tokenAmount);
      setOwnsToken(hasTokens);
    }
  };

  const checkChannelSubscription = async (channelUsername: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await taskApi.checkChannelSubscription(user.id, channelUsername);
      return response.isSubscribed;
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      return false;
    }
  };

  const checkTokenOwnership = async (tokenAddress: string, requiredAmount: number): Promise<boolean> => {
    if (!user?.walletAddress) return false;
    try {
      const response = await taskApi.checkTokenOwnership(user.walletAddress, tokenAddress, requiredAmount);
      return response.hasEnoughTokens;
    } catch (error) {
      console.error('Error checking token ownership:', error);
      return false;
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !user) return;

    try {
      const response = await taskApi.completeTask(task.id, user.id);
      if (response.success) {
        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setTask({ ...task, completed: true });
      } else {
        setMessage(response.error || 'Произошла ошибка при выполнении задания');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Произошла ошибка при выполнении задания');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!task) {
    return <div className="error">Задание не найдено</div>;
  }

  return (
    <div className="token-task-detail">
      <UniversalTaskCard
        {...task}
        onSubscribe={() => {}} // Для токен-заданий подписка не требуется
      />
      <div className="task-description">
        <h2>Описание задания</h2>
        <p>{task.description}</p>
      </div>
      <div className="task-requirements">
        <h2>Требования</h2>
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