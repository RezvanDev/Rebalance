import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import taskApi from '../api/taskApi';
import '../styles/TokenTaskDetail.css';

interface TokenTask {
  id: number;
  title: string;
  description: string;
  reward: string;
  channelUsername?: string;
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
  const [task, setTask] = useState<TokenTask | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(true);  // Заглушка
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, [tokenId]);

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

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks('TOKEN');
      if (response.success && Array.isArray(response.tasks)) {
        const currentTask = response.tasks.find((t: TokenTask) => t.id === Number(tokenId));
        if (currentTask) {
          setTask(currentTask);
          if (currentTask.channelUsername) {
            checkSubscription(currentTask.channelUsername);
          }
        } else {
          navigate('/token-tasks');
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
  };

  const checkSubscription = async (channelUsername: string) => {
    try {
      const response = await taskApi.checkChannelSubscription(user?.id || '', channelUsername);
      setIsSubscribed(response.isSubscribed);
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      setIsSubscribed(false);
    }
  };

  const handleSubscribe = () => {
    if (task?.channelUsername) {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
    }
  };

  const handleBuyTokens = () => {
    setMessage('Переход на страницу покупки токенов');
    // Здесь можно добавить логику для перехода на страницу покупки токенов
  };

  const handleCompleteTask = async () => {
    if (!task || !user) return;

    try {
      const response = await taskApi.completeTask(task.id, user.id);

      if (response.success) {
        const rewardAmount = Number(task.reward.split(' ')[0]);
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Выполнение задания ${task.title}`
        });

        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setTask({ ...task, completed: true });
        setTimeout(() => navigate('/token-tasks'), 3000);
      } else {
        setMessage(response.error || 'Произошла ошибка при выполнении задания');
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
        {task.channelUsername && (
          <div className="task-step" onClick={handleSubscribe}>
            <p>1. Подписаться на канал @{task.channelUsername}</p>
            {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
          </div>
        )}
        <div className="task-step" onClick={handleBuyTokens}>
          <p>2. Купите минимум {task.tokenAmount} токенов</p>
          {ownsToken ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
      </div>
      <button 
        className="check-completion-button" 
        onClick={handleCompleteTask} 
        disabled={task.completed || (task.channelUsername && !isSubscribed) || !ownsToken}
      >
        {task.completed ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;