import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useUserBalance } from '../hooks/useUserBalance';
import { useTransactions } from '../hooks/useTransactions';
import { checkTokenOwnership } from '../utils/blockchain';
import { tokenTasks, TokenTask } from '../config/tokenTasks';
import { distributeReferralRewards } from '../utils/referralSystem';
import '../styles/TokenTaskDetail.css';
import { useTypeSelector } from '../hooks/useTypeSelector';
import { useActions } from '../hooks/useActions';
import { switchAddress } from '../config/tokenAddress';

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { tokenId } = useParams<{ tokenId: string }>();
  const { addToBalance } = useUserBalance();
  const { addTransaction } = useTransactions();
  const [task, setTask] = useState<TokenTask | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  ///////////////
  const { tasks, loading } = useTypeSelector((state) => state.tasks);
  const { fetchTask } = useActions();

  useEffect(() => {
    fetchTask("CHANNEL");
  }, []);

  useEffect(() => {
    const currentTask = tasks.find(t => t.id === Number(tokenId));
    if (currentTask) {
      setTask(currentTask);
    } else {
      navigate('/token-tasks');
    }
  }, [tokenId, navigate]);


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

  const handleSubscribe = () => {
    if (task) {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
    }
  };

  const handleBuyTokens = () => {
    setMessage('Переход на страницу покупки токенов');
  };

  const handleCheckCompletion = async () => {
    if (isTaskCompleted) {
      setMessage('Вы уже выполнили это задание');
      return;
    }

    if (task && user) {
      const subscriptionStatus = await checkChannelSubscription(`https://t.me/${task.channelUsername}`);
      const tokenOwnershipStatus = await checkTokenOwnership(user.id, task.tokenAddress, task.tokenAmount);

      setIsSubscribed(subscriptionStatus);
      setOwnsToken(tokenOwnershipStatus);

      if (subscriptionStatus && tokenOwnershipStatus) {
        const rewardAmount = Number(task.reward);
        addToBalance(rewardAmount);
        
        // Добавляем транзакцию
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} REBA`,
          description: `Выполнение задания ${task.name}`
        });

        // Распределение реферальных наград
        await distributeReferralRewards(user.id, rewardAmount);

        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setIsTaskCompleted(true);
        setTimeout(() => navigate('/token-tasks'), 3000);
      } else {
        setMessage('Пожалуйста, выполните все шаги задания');
      }
    }
  };

  const checkChannelSubscription = async (channelUsername: string): Promise<boolean> => {
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
      console.error('Telegram Web App is not properly initialized');
      return false;
    }
  
    try {
      // Убедимся, что channelUsername начинается с '@'
      const formattedChannelUsername = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;
  
      // Используем метод getChatMember для проверки статуса пользователя в канале
      const chatMember = await tg.getChatMember(formattedChannelUsername);
  
      // Проверяем, является ли пользователь подписчиком, администратором или создателем канала
      const isSubscribed = ['member', 'administrator', 'creator'].includes(chatMember.status);
  
      return isSubscribed;
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      
      // Если произошла ошибка, предполагаем, что пользователь не подписан
      return false;
    }
  };

  if (!task) {
    return <div>Загрузка...</div>;
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
        <p className="progress">? из {task.maxParticipants}</p>
        <p className="progress-note">В этом задании ограниченное количество участников</p>
      </div>
      <div className="info-card">
        <h2>Задание</h2>
        <div className="task-step" onClick={handleSubscribe}>
          <p>1. Подписаться на канал {task.title}</p>
          {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
        <div className="task-step" onClick={handleBuyTokens}>
          <p>2. Купите минимум {task.tokenAmount} {switchAddress(task.tokenAddress)}</p>
          {ownsToken ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
      </div>
      <button className="check-completion-button" onClick={handleCheckCompletion} disabled={isTaskCompleted}>
        {isTaskCompleted ? 'Задание выполнено' : 'Проверить выполнение'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;