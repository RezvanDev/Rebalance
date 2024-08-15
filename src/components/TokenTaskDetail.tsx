import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import taskApi from '../api/taskApi';
import '../styles/TokenTaskDetail.css';

interface TokenTask {
  id: number;
  name: string;
  description: string;
  reward: string;
  channelLink: string;
  tokenAddress: string;
  requiredTokenAmount: number;
  maxParticipants: number;
  completed: boolean;
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { tokenId } = useParams<{ tokenId: string }>();
  const { fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [task, setTask] = useState<TokenTask | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(true);  // Заглушка: всегда true
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
        const currentTask = response.tasks.find((t: any) => t.id === Number(tokenId));
        if (currentTask) {
          setTask({
            id: currentTask.id,
            name: currentTask.title,
            description: currentTask.description,
            reward: `${currentTask.reward} LIBRA`,
            channelLink: currentTask.channelUsername,
            tokenAddress: currentTask.tokenAddress,
            requiredTokenAmount: currentTask.tokenAmount,
            maxParticipants: currentTask.maxParticipants,
            completed: currentTask.completed
          });
          checkSubscription(currentTask.channelUsername);
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
      const response = await taskApi.checkChannelSubscription(user?.id, channelUsername);
      setIsSubscribed(response.isSubscribed);
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      setIsSubscribed(false);
    }
  };

  const handleSubscribe = () => {
    if (task) {
      window.open(`https://t.me/${task.channelLink}`, '_blank');
    }
  };

  const handleBuyTokens = () => {
    setMessage('Переход на страницу покупки токенов');
    // Здесь можно добавить логику для перехода на страницу покупки токенов
  };

  const handleCheckCompletion = async () => {
    if (!task || !user) return;

    if (task.completed) {
      setMessage('Вы уже выполнили это задание');
      return;
    }

    try {
      const completeResponse = await taskApi.completeTask(task.id, user.id);

      if (completeResponse.success) {
        const rewardAmount = Number(task.reward.split(' ')[0]);
        await fetchBalance();  // Обновляем баланс
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Выполнение задания ${task.name}`
        });

        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setTask({ ...task, completed: true });
        setTimeout(() => navigate('/token-tasks'), 3000);
      } else {
        setMessage(completeResponse.error || 'Произошла ошибка при выполнении задания');
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
      <h1 className="task-name">{task.name}</h1>
      <p className="task-description">{task.description}</p>
      <div className="info-card">
        <h2>Награда</h2>
        <p className="reward">{task.reward}</p>
      </div>
      <div className="info-card">
        <h2>Выполнили</h2>
        <p className="progress">? из {task.maxParticipants}</p>
        <p className="progress-note">В этом задании ограниченное количество участников</p>
      </div>
      <div className="info-card">
        <h2>Задание</h2>
        <div className="task-step" onClick={handleSubscribe}>
          <p>1. Подписаться на канал {task.name}</p>
          {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
        <div className="task-step" onClick={handleBuyTokens}>
          <p>2. Купите минимум {task.requiredTokenAmount} {task.name.split(' ')[0]}</p>
          {ownsToken ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
      </div>
      <button 
        className="check-completion-button" 
        onClick={handleCheckCompletion} 
        disabled={task.completed || !isSubscribed || !ownsToken}
      >
        {task.completed ? 'Задание выполнено' : 'Проверить выполнение'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;