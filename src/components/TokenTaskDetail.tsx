import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import { taskApi } from '../api/taskApi';
import api from '../utils/api';
import '../styles/TokenTaskDetail.css';

interface Task {
  id: number;
  title: string;
  description: string;
  reward: string | number;
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
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const response = await taskApi.getTasks('TOKEN');
      if (response && Array.isArray(response.tasks)) {
        const foundTask = response.tasks.find((t: Task) => t.id === Number(taskId));
        if (foundTask) {
          setTask(foundTask);
          setError(null);
          // Не проверяем требования автоматически, пользователь сделает это сам
        } else {
          throw new Error('Задание не найдено');
        }
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (err: any) {
      console.error('Error fetching task:', err);
      setError(err.message || 'Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const checkChannelSubscription = async () => {
    if (!task?.channelUsername || !user) return;
    try {
      setLoading(true);
      const response = await api.get('/telegram/check-subscription', {
        params: { telegramId: user.id, channelUsername: task.channelUsername }
      });
      setIsSubscribed(response.data.isSubscribed);
      setMessage(response.data.isSubscribed ? 'Вы подписаны на канал!' : 'Вы не подписаны на канал. Пожалуйста, подпишитесь и проверьте снова.');
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      setMessage('Ошибка при проверке подписки на канал');
    } finally {
      setLoading(false);
    }
  };

  const checkTokenBalance = async () => {
    // Заглушка для проверки токенов
    setHasEnoughTokens(true);
    setMessage('У вас достаточно токенов для выполнения задания');
  };

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

  const handleCompleteTask = async () => {
    if (!task || !user) return;
    try {
      const completeResponse = await taskApi.completeTask(task.id, user.id.toString());

      if (completeResponse.success) {
        const rewardAmount = typeof task.reward === 'string' ? parseInt(task.reward) : task.reward;
        
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Выполнение задания: ${task.title}`
        });

        setMessage(`Поздравляем! Вы выполнили задание и получили ${rewardAmount} LIBRA!`);
        setTask({ ...task, completed: true });
      } else {
        setMessage(completeResponse.error || 'Произошла ошибка при выполнении задания.');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      setMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания. Пожалуйста, попробуйте еще раз.');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка деталей задания...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!task) {
    return <div className="error">Задание не найдено</div>;
  }

  return (
    <div className="token-task-detail">
      {message && <div className="message">{message}</div>}
      <h1>{task.title}</h1>
      <p className="description">{task.description}</p>
      <div className="task-info">
        <p className="reward">Награда: {task.reward} LIBRA</p>
        {task.tokenAmount && <p className="token-amount">Требуемое количество токенов: {task.tokenAmount}</p>}
        <p className="progress">Прогресс: {task.currentParticipants}/{task.maxParticipants}</p>
      </div>
      <div className="task-requirements">
        <p>Требования:</p>
        <ul>
          {task.channelUsername && (
            <li className={isSubscribed ? 'completed' : ''}>
              {isSubscribed ? '✓ ' : ''}Подписаться на канал @{task.channelUsername}
              <button onClick={checkChannelSubscription} className="check-button">
                Проверить подписку
              </button>
            </li>
          )}
          {task.tokenAmount && (
            <li className={hasEnoughTokens ? 'completed' : ''}>
              {hasEnoughTokens ? '✓ ' : ''}Иметь {task.tokenAmount} токенов на балансе
              <button onClick={checkTokenBalance} className="check-button">
                Проверить баланс
              </button>
            </li>
          )}
        </ul>
      </div>
      <button 
        className="complete-button"
        onClick={handleCompleteTask} 
        disabled={!isSubscribed || !hasEnoughTokens || task.completed}
      >
        {task.completed ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
    </div>
  );
};

export default TokenTaskDetail;