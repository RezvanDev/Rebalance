import React, { useState, useEffect, useCallback } from 'react';
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
  channelUsername: string;
  tokenAddress: string;
  tokenAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  completed: boolean;
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { tokenId } = useParams<{ tokenId: string }>();
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTask = useCallback(async () => {
    if (!user || !tokenId) return;
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${tokenId}`);
      if (response.data && response.data.task) {
        setTask(response.data.task);
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        if (completedTasks.includes(Number(tokenId))) {
          setTask(prevTask => prevTask ? { ...prevTask, completed: true } : null);
        }
      } else {
        throw new Error('Задание не найдено');
      }
    } catch (err: any) {
      console.error('Error fetching task:', err);
      setMessage('Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  }, [user, tokenId]);

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

  const checkSubscription = useCallback(async () => {
    if (!task || !user) return;
    try {
      const response = await api.get('/telegram/check-subscription', {
        params: { telegramId: user.id, channelUsername: task.channelUsername }
      });
      setIsSubscribed(response.data.isSubscribed);
      console.log('Subscription status:', response.data.isSubscribed);
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      setIsSubscribed(false);
    }
  }, [task, user]);

  useEffect(() => {
    if (task && user) {
      checkSubscription();
    }
  }, [task, user, checkSubscription]);

  const handleSubscribe = () => {
    if (task?.channelUsername) {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
      setTimeout(checkSubscription, 3000);
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !user) return;

    try {
      await checkSubscription();

      if (!isSubscribed) {
        setMessage('Пожалуйста, подпишитесь на канал перед выполнением задания');
        return;
      }

      // Здесь можно добавить проверку баланса токенов, когда эта функциональность будет готова
      // const hasEnoughTokens = await checkTokenBalance(user.id, task.tokenAddress, task.tokenAmount);
      // if (!hasEnoughTokens) {
      //   setMessage('У вас недостаточно токенов для выполнения этого задания');
      //   return;
      // }

      const completeResponse = await api.post(`/tasks/${task.id}/complete`, { telegramId: user.id });

      if (completeResponse.data.success) {
        const rewardAmount = Number(task.reward.split(' ')[0]);
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Выполнение задания ${task.title}`
        });

        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setTask(prevTask => prevTask ? { ...prevTask, completed: true } : null);
        
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(task.id);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
        
        setTimeout(() => navigate('/token-tasks'), 3000);
      } else {
        setMessage(completeResponse.data.error || 'Произошла ошибка при выполнении задания');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      setMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка задания...</div>;
  }

  if (!task) {
    return <div className="error">Задание не найдено</div>;
  }

  return (
    <div className="token-task-detail">
      <h1 className="task-name">{task.title}</h1>
      <p className="task-description">{task.description}</p>
      <div className="info-card">
        <h2>Награда</h2>
        <p className="reward">{task.reward}</p>
      </div>
      <div className="info-card">
        <h2>Выполнили</h2>
        <p className="progress">{task.currentParticipants} из {task.maxParticipants}</p>
        <p className="progress-note">В этом задании ограниченное количество участников</p>
      </div>
      <div className="info-card">
        <h2>Задание</h2>
        <div className="task-step" onClick={handleSubscribe}>
          <p>1. Подписаться на канал @{task.channelUsername}</p>
          {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
        <div className="task-step">
          <p>2. Иметь {task.tokenAmount} токенов на балансе</p>
          <span className="completed">✓</span>
        </div>
      </div>
      <button 
        className="complete-button"
        onClick={handleCompleteTask} 
        disabled={task.completed || !isSubscribed}
      >
        {task.completed ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;