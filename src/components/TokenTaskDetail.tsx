import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
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
      console.log(`Fetching task with ID: ${tokenId}`);
      const response = await api.get(`/tasks/${tokenId}`);
      console.log('Task response:', response.data);
      if (response.data && response.data.task) {
        setTask(response.data.task);
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        console.log('Completed tasks from localStorage:', completedTasks);
        if (completedTasks.includes(Number(tokenId))) {
          console.log(`Task ${tokenId} is marked as completed in localStorage`);
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

  const fetchTask = useCallback(async () => {
    if (!user || !tokenId) return;
    try {
      setLoading(true);
      console.log(`Fetching task with ID: ${tokenId}`);
      const response = await taskApi.getTasks('TOKEN');
      console.log('Tasks response:', response);
      const task = response.tasks.find((t: Task) => t.id === Number(tokenId));
      if (task) {
        console.log('Found task:', task);
        setTask(task);
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        console.log('Completed tasks from localStorage:', completedTasks);
        if (completedTasks.includes(Number(tokenId))) {
          console.log(`Task ${tokenId} is marked as completed in localStorage`);
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
  
  const checkSubscription = useCallback(async () => {
    if (!task || !user) return;
    try {
      console.log(`Checking subscription for user ${user.id} to channel ${task.channelUsername}`);
      const response = await taskApi.checkChannelSubscription(user.id.toString(), task.channelUsername);
      console.log('Subscription check response:', response);
      setIsSubscribed(response.isSubscribed);
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      setIsSubscribed(false);
    }
  }, [task, user]);
  
  const handleCompleteTask = async () => {
    if (!task || !user) return;
  
    try {
      await checkSubscription();
  
      if (!isSubscribed) {
        setMessage('Пожалуйста, подпишитесь на канал перед выполнением задания');
        return;
      }
  
      console.log(`Attempting to complete task ${task.id} for user ${user.id}`);
      const completeResponse = await taskApi.completeTask(task.id, user.id.toString());
      console.log('Complete task response:', completeResponse);
  
      if (completeResponse.success) {
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
        console.log(`Updated completed tasks in localStorage:`, completedTasks);
        
        setTimeout(() => navigate('/token-tasks'), 3000);
      } else {
        setMessage(completeResponse.error || 'Произошла ошибка при выполнении задания');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      setMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания');
    }
  };

  const handleRefresh = () => {
    fetchTask();
    checkSubscription();
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
      <button 
        className="refresh-button"
        onClick={handleRefresh}
      >
        Обновить статус
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;