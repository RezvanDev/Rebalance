import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { taskApi } from '../api/taskApi';
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
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchTask(parseInt(taskId));
    }
  }, [taskId]);

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

  const fetchTask = async (id: number) => {
    try {
      setLoading(true);
      const response = await taskApi.getTaskById(id);
      if (response && response.task) {
        setTask(response.task);
        checkRequirements(response.task);
      } else {
        setMessage('Задание не найдено');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage('Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  };

  const checkRequirements = async (task: Task) => {
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
    // Реализация проверки подписки на канал
    return true; // Заглушка
  };

  const checkTokenOwnership = async (tokenAddress: string, requiredAmount: number): Promise<boolean> => {
    // Реализация проверки владения токенами
    return true; // Заглушка
  };

  const handleCompleteTask = async () => {
    if (!task || !user) return;

    try {
      const response = await taskApi.completeTask(task.id, user.id.toString());
      setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
      setTask({ ...task, completed: true });
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Произошла ошибка при выполнении задания');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!task) {
    return <div className="error">{message || 'Задание не найдено'}</div>;
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
          <li className={isSubscribed ? 'completed' : ''}>
            Подписаться на канал @{task.channelUsername}
          </li>
          <li className={ownsToken ? 'completed' : ''}>
            Иметь {task.tokenAmount} токенов на балансе
          </li>
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