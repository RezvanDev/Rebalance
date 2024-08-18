import React, { useState, useEffect, useCallback } from 'react';
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
  reward: string;
  completed: boolean;
  channelUsername: string;
  tokenAddress: string;
  tokenAmount: number;
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [task, setTask] = useState<Task | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasTokens, setHasTokens] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId || !user) return;
    try {
      setLoading(true);
      const response = await taskApi.getTasks('TOKEN');
      if (response && Array.isArray(response.tasks)) {
        const foundTask = response.tasks.find((t: Task) => t.id === Number(taskId));
        if (foundTask) {
          const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
          setTask({
            ...foundTask,
            completed: completedTasks.includes(foundTask.id)
          });
          setError(null);
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

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const checkChannelSubscription = async () => {
    if (!task?.channelUsername || !user) return;
    try {
      const response = await api.get('/telegram/check-subscription', {
        params: { telegramId: user.id, channelUsername: task.channelUsername }
      });
      setIsSubscribed(response.data.isSubscribed);
      showMessage(response.data.isSubscribed ? 'Вы подписаны на канал!' : 'Вы не подписаны на канал. Пожалуйста, подпишитесь и проверьте снова.');
    } catch (error: any) {
      console.error('Ошибка при проверке подписки на канал:', error);
      showMessage(error.response?.data?.error || 'Ошибка при проверке подписки на канал');
    }
  };

  const checkTokenBalance = async () => {
    if (!task || !user) return;
    try {
      // Здесь должен быть запрос на проверку баланса токенов
      // Так как эта функциональность не реализована на сервере, мы просто показываем сообщение
      showMessage('Проверка баланса токенов в настоящее время недоступна.');
      setHasTokens(false); // Устанавливаем в false, так как не можем проверить
    } catch (error: any) {
      console.error('Ошибка при проверке баланса токенов:', error);
      showMessage('Ошибка при проверке баланса токенов');
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !user || task.completed) return;

    if (!isSubscribed) {
      showMessage('Пожалуйста, подпишитесь на канал перед выполнением задания.');
      return;
    }

    if (!hasTokens) {
      showMessage('Для выполнения задания необходимо иметь достаточное количество токенов.');
      return;
    }

    try {
      const completeResponse = await taskApi.completeTask(task.id, user.id.toString());

      if (completeResponse.success) {
        const rewardAmount = parseInt(task.reward.split(' ')[0]);
        
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Выполнение задания: ${task.title}`
        });

        showMessage(`Вы получили ${task.reward} за выполнение задания!`);
        
        setTask({ ...task, completed: true });
        
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(task.id);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
      } else {
        showMessage(completeResponse.error || 'Произошла ошибка при выполнении задания.');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      showMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания. Пожалуйста, попробуйте еще раз.');
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
        <p className="reward">Награда: {task.reward}</p>
        <p className="channel">Требуется подписка на канал: @{task.channelUsername}</p>
        <p className="token-requirement">Требуется токенов: {task.tokenAmount}</p>
      </div>
      <a 
        href={`https://t.me/${task.channelUsername}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="subscribe-link"
      >
        Перейти на канал
      </a>
      <button onClick={checkChannelSubscription} className="check-subscription-button">
        Проверить подписку
      </button>
      <button onClick={checkTokenBalance} className="check-balance-button">
        Проверить баланс токенов
      </button>
      <button 
        className="complete-button"
        onClick={handleCompleteTask} 
        disabled={task.completed || !isSubscribed || !hasTokens}
      >
        {task.completed ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
    </div>
  );
};

export default TokenTaskDetail;