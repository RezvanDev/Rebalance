import React, { useEffect, useState, useCallback } from 'react';
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
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${taskId}`);
      if (response.data && response.data.task) {
        setTask(response.data.task);
        setError(null);
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (err: any) {
      console.error('Error fetching task:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

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

  const handleCompleteTask = async () => {
    if (!task || !user) return;
    try {
      const completeResponse = await api.post(`/tasks/${task.id}/complete`, { telegramId: user.id });

      if (completeResponse.data.success) {
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
        showMessage(completeResponse.data.error || 'Произошла ошибка при выполнении задания.');
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

  const isCompleted = user ? JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]').includes(task.id) : false;

  return (
    <div className="token-task-detail">
      {message && <div className="message">{message}</div>}
      <h1>{task.title}</h1>
      <p className="description">{task.description}</p>
      <div className="task-info">
        <p className="reward">Награда: {task.reward}</p>
        {task.tokenAmount && <p className="token-amount">Требуемое количество токенов: {task.tokenAmount}</p>}
        {task.channelUsername && <p className="channel">Требуется подписка на канал: @{task.channelUsername}</p>}
        <p className="progress">Прогресс: {task.currentParticipants}/{task.maxParticipants}</p>
      </div>
      <button 
        className="complete-button"
        onClick={handleCompleteTask} 
        disabled={isCompleted}
      >
        {isCompleted ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
    </div>
  );
};

export default TokenTaskDetail;