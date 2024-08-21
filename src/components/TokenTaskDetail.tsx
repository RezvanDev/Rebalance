import React, { useEffect, useState, useCallback } from 'react';
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
  completed: boolean;
  channelUsername?: string;
  tokenAddress?: string;
  tokenAmount?: number;
  maxParticipants?: number;
  currentParticipants?: number;
  channelLink?: string;
  buyLink?: string;
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const response = await taskApi.getTasks('TOKEN');
      const fetchedTask = response.tasks.find((t: Task) => t.id === parseInt(taskId));
      if (fetchedTask) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user?.id}`) || '[]');
        setTask({
          ...fetchedTask,
          completed: completedTasks.includes(fetchedTask.id)
        });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      showMessage('Ошибка при загрузке задания');
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

  const handleChannelClick = () => {
    if (task?.channelLink) {
      window.open(task.channelLink, '_blank');
    }
  };

  const handleBuyClick = () => {
    if (task?.buyLink) {
      window.open(task.buyLink, '_blank');
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !user || task.completed) return;

    try {
      const response = await taskApi.completeTask(task.id, user.id);
      
      if (response.success) {
        const rewardAmount = parseFloat(task.reward.split(' ')[0]);
        
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} ${task.title}`,
          description: `Выполнение задания ${task.title}`
        });

        showMessage(`Вы получили ${task.reward} за выполнение задания!`);
        
        setTask({ ...task, completed: true });
        
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(task.id);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
      } else {
        showMessage(response.error || 'Произошла ошибка при выполнении задания.');
      }
    } catch (error: any) {
      console.error('Error completing token task:', error);
      showMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleRefresh = () => {
    showMessage('Обновление информации о задании...');
    fetchTask();
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!task) {
    return <div className="error">Задание не найдено</div>;
  }

  return (
    <div className="token-task-detail">
      <h1>{task.title}</h1>
      <p className="description">{task.description}</p>
      <div className="task-info">
        <div className="info-block reward">
          <h3>Награда</h3>
          <p>{task.reward} {task.title}</p>
        </div>
        <div className="info-block progress">
          <h3>Выполнили</h3>
          <p>{task.currentParticipants} из {task.maxParticipants}</p>
          <span>В этом задании ограниченное количество участников</span>
        </div>
      </div>
      <div className="task-requirements">
        <h3>Задание</h3>
        <ul>
          {task.channelUsername && (
            <li onClick={handleChannelClick}>
              1. Подписаться на канал {task.channelUsername}
              <span className="arrow">›</span>
            </li>
          )}
          {task.tokenAmount && (
            <li onClick={handleBuyClick}>
              2. Купите минимум {task.tokenAmount} {task.title}
              <span className="arrow">›</span>
            </li>
          )}
        </ul>
      </div>
      <button 
        className="complete-button"
        onClick={handleCompleteTask}
        disabled={task.completed}
      >
        {task.completed ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
      <button className="refresh-button" onClick={handleRefresh}>↻</button>
      {message && <div className="message">{message}</div>}
      <p className="balance">Текущий баланс: {balance} LIBRA</p>
    </div>
  );
};

export default TokenTaskDetail;