import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useTransactions } from '../hooks/useTransactions';
import { useBalance } from '../context/BalanceContext';
import { checkTokenOwnership } from '../utils/blockchain';
import api from '../utils/api';
import '../styles/TokenTaskDetail.css';

interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  channelUsername: string;
  tokenAddress: string;
  tokenAmount: number;
  maxParticipants: number;
  currentParticipants: number;
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { addTransaction } = useTransactions();
  const { balance, fetchBalance } = useBalance();
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${taskId}`);
      if (response.data && response.data.task) {
        setTask(response.data.task);
        if (user) {
          await checkRequirements(response.data.task);
        }
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage('Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  }, [taskId, user]);

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

  const checkRequirements = async (taskData: Task) => {
    const subscriptionStatus = await checkChannelSubscription(taskData.channelUsername);
    const tokenOwnershipStatus = await checkTokenOwnership(user!.id, taskData.tokenAddress, taskData.tokenAmount);
    setIsSubscribed(subscriptionStatus);
    setOwnsToken(tokenOwnershipStatus);
  };

  const checkChannelSubscription = async (channelUsername: string): Promise<boolean> => {
    try {
      const response = await api.get('/check-subscription', { params: { telegramId: user?.id, channelUsername } });
      return response.data.isSubscribed;
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      return false;
    }
  };

  const handleSubscribe = () => {
    if (task) {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
      setTimeout(async () => {
        const subscriptionStatus = await checkChannelSubscription(task.channelUsername);
        setIsSubscribed(subscriptionStatus);
      }, 5000);
    }
  };

  const handleBuyTokens = () => {
    setMessage('Переход на страницу покупки токенов');
    // Здесь можно добавить логику для перехода на страницу покупки токенов
  };

  const handleCheckCompletion = async () => {
    if (!task || !user) return;

    try {
      await checkRequirements(task);

      if (!isSubscribed || !ownsToken) {
        setMessage('Пожалуйста, выполните все условия задания');
        return;
      }

      const response = await api.post(`/tasks/${task.id}/complete`, { telegramId: user.id });
      if (response.data.success) {
        const rewardAmount = parseFloat(task.reward);
        
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} REBA`,
          description: `Выполнение задания ${task.title}`
        });

        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setIsTaskCompleted(true);

        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(task.id);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));

        setTimeout(() => navigate('/token-tasks'), 3000);
      } else {
        setMessage(response.data.error || 'Ошибка при выполнении задания');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      setMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!task) {
    return <div className="error">Задание не найдено</div>;
  }

  return (
    <div className="token-task-detail">
      <h1 className="task-title">{task.title}</h1>
      <p className="task-description">{task.description}</p>
      
      <div className="task-info-box">
        <div className="info-label">Награда</div>
        <div className="info-value">{task.reward} REBA</div>
      </div>
      
      <div className="task-info-box">
        <div className="info-label">Выполнили</div>
        <div className="info-value">
          {task.currentParticipants} из {task.maxParticipants}
        </div>
        <div className="info-subtext">В этом задании ограниченное количество участников</div>
      </div>
      
      <div className="task-requirements">
        <h2>Задание</h2>
        <ol>
          <li onClick={handleSubscribe}>
            Подписаться на канал {task.channelUsername}
            {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
          </li>
          <li onClick={handleBuyTokens}>
            Купите минимум {task.tokenAmount} REBA
            {ownsToken ? <span className="completed">✓</span> : <span className="arrow">›</span>}
          </li>
        </ol>
      </div>

      <button 
        className="check-completion-button" 
        onClick={handleCheckCompletion} 
        disabled={isTaskCompleted}
      >
        {isTaskCompleted ? 'Задание выполнено' : 'Проверить выполнение'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;