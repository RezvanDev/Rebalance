import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useTransactions } from '../hooks/useTransactions';
import { checkTokenOwnership } from '../utils/blockchain';
import { taskApi } from '../api/taskApi';
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
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
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
      const taskData = await taskApi.getTaskDetails(id);
      setTask(taskData);
      if (user) {
        const subscriptionStatus = await checkChannelSubscription(taskData.channelUsername);
        const tokenOwnershipStatus = await checkTokenOwnership(user.id, taskData.tokenAddress, taskData.tokenAmount);
        setIsSubscribed(subscriptionStatus);
        setOwnsToken(tokenOwnershipStatus);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage('Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (task) {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
    }
  };

  const handleBuyTokens = () => {
    setMessage('Переход на страницу покупки токенов');
    // Здесь можно добавить логику для перехода на страницу покупки токенов
  };

  const handleCheckCompletion = async () => {
    if (!task || !user) return;

    try {
      const response = await taskApi.completeTask(task.id, user.id);
      if (response.success) {
        const rewardAmount = parseFloat(task.reward);
        addToBalance(rewardAmount);
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} REBA`,
          description: `Выполнение задания ${task.title}`
        });
        await distributeReferralRewards(user.id, rewardAmount);
        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setIsTaskCompleted(true);
        setTimeout(() => navigate('/token-tasks'), 3000);
      } else {
        setMessage(response.error || 'Ошибка при выполнении задания');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Произошла ошибка при выполнении задания');
    }
  };

  const checkChannelSubscription = async (channelUsername: string): Promise<boolean> => {
    try {
      const response = await taskApi.checkChannelSubscription(user?.id || '', channelUsername);
      return response.isSubscribed;
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      return false;
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
        disabled={isTaskCompleted || !isSubscribed || !ownsToken}
      >
        {isTaskCompleted ? 'Задание выполнено' : 'Проверить выполнение'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;