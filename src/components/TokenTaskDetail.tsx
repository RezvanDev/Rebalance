import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/reducers';
import { completeTaskAction } from '../redux/store/actions/taskActions';
import { checkTokenOwnership } from '../utils/blockchain';
import '../styles/TokenTaskDetail.css';

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tokenId } = useParams<{ tokenId: string }>();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const [task, setTask] = useState(tasks.find(t => t.id === Number(tokenId)));
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      navigate('/token-tasks');
    }
  }, [task, navigate]);

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
    if (task && task.channelUsername) {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
    }
  };

  const handleBuyTokens = () => {
    setMessage('Переход на страницу покупки токенов');
  };

  const handleCheckCompletion = async () => {
    if (task && task.completed) {
      setMessage('Вы уже выполнили это задание');
      return;
    }

    if (task && user) {
      const subscriptionStatus = await checkChannelSubscription(task.channelUsername || '');
      const tokenOwnershipStatus = await checkTokenOwnership(user.id, task.tokenAddress || '', task.tokenAmount || 0);

      setIsSubscribed(subscriptionStatus);
      setOwnsToken(tokenOwnershipStatus);

      if (subscriptionStatus && tokenOwnershipStatus) {
        try {
          await dispatch(completeTaskAction(task.id));
          setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
          setTimeout(() => navigate('/token-tasks'), 3000);
        } catch (error) {
          setMessage('Произошла ошибка при выполнении задания');
        }
      } else {
        setMessage('Пожалуйста, выполните все шаги задания');
      }
    }
  };

  const checkChannelSubscription = async (channelUsername: string): Promise<boolean> => {
    // Implement the logic to check channel subscription
    return true; // Placeholder
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
        <h2>Задание</h2>
        <div className="task-step" onClick={handleSubscribe}>
          <p>1. Подписаться на канал {task.channelUsername}</p>
          {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
        <div className="task-step" onClick={handleBuyTokens}>
          <p>2. Купите минимум {task.tokenAmount} токенов</p>
          {ownsToken ? <span className="completed">✓</span> : <span className="arrow">›</span>}
        </div>
      </div>
      <button className="check-completion-button" onClick={handleCheckCompletion} disabled={task.completed}>
        {task.completed ? 'Задание выполнено' : 'Проверить выполнение'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;