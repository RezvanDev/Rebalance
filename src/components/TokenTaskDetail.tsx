import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useTransactions } from '../hooks/useTransactions';
import { useBalance } from '../context/BalanceContext';
import api from '../utils/api';
import '../styles/TokenTaskDetail.css';

interface Task {
  id: number;
  type: 'CHANNEL' | 'TOKEN';
  title: string;
  reward: string;
  maxParticipants: number;
  currentParticipants: number;
  channelUsername?: string;
  description?: string;
  tokenAddress?: string;
  tokenAmount?: number;
}

const TaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { addTransaction } = useTransactions();
  const { balance, fetchBalance } = useBalance();
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(true);  // Заглушка: предполагаем, что токены уже куплены
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
        if (user && response.data.task.type === 'CHANNEL') {
          await checkChannelSubscription(response.data.task.channelUsername);
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
      tg.BackButton.onClick(() => navigate('/tasks'));
    }
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  const checkChannelSubscription = async (channelUsername?: string) => {
    if (!channelUsername || !user) return;
    try {
      console.log('Checking subscription for channel:', channelUsername);
      const response = await api.get('/check-subscription', { params: { telegramId: user.id, channelUsername } });
      console.log('Subscription check response:', response.data);
      setIsSubscribed(response.data.isSubscribed);
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      setMessage('Ошибка при проверке подписки на канал');
    }
  };

  const handleSubscribe = () => {
    if (task && task.channelUsername) {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
      setMessage('Пожалуйста, подпишитесь на канал и нажмите "Проверить выполнение"');
    }
  };

  const handleCheckCompletion = async () => {
    if (!task || !user) return;

    try {
      console.log('Checking completion for task:', task);
      console.log('User:', user);

      if (task.type === 'CHANNEL' || (task.type === 'TOKEN' && task.channelUsername)) {
        await checkChannelSubscription(task.channelUsername);
      }

      if ((task.type === 'CHANNEL' || (task.type === 'TOKEN' && task.channelUsername)) && !isSubscribed) {
        setMessage('Пожалуйста, подпишитесь на канал');
        return;
      }

      console.log('Sending completion request');
      const response = await api.post(`/tasks/${task.id}/complete`, { telegramId: user.id });
      console.log('Completion response:', response.data);

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

        setTimeout(() => navigate('/tasks'), 3000);
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
    <div className="task-detail">
      <h1 className="task-title">{task.title}</h1>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
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
        {task.channelUsername && (
          <div onClick={handleSubscribe} className="requirement-item">
            Подписаться на канал {task.channelUsername}
            {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
          </div>
        )}
        {task.type === 'TOKEN' && task.tokenAmount && (
          <div className="requirement-item">
            Купите минимум {task.tokenAmount} REBA
            <span className="completed">✓</span>
          </div>
        )}
      </div>

      <button 
        className="check-completion-button" 
        onClick={handleCheckCompletion} 
        disabled={isTaskCompleted}
      >
        {isTaskCompleted ? 'Задание выполнено' : 'Проверить выполнение'}
      </button>
      {message && <div className="message">{message}</div>}
      <div className="debug-info">
        <h3>Отладочная информация:</h3>
        <p>Task ID: {task.id}</p>
        <p>Task Type: {task.type}</p>
        <p>User ID: {user?.id}</p>
        <p>Telegram ID: {user?.telegramId}</p>
        <p>Wallet Address: {user?.walletAddress || 'Не указан'}</p>
        <p>Is Subscribed: {isSubscribed ? 'Да' : 'Нет'}</p>
        <p>Owns Token: {ownsToken ? 'Да' : 'Нет'}</p>
      </div>
    </div>
  );
};

export default TaskDetail;