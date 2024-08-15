import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { taskApi } from '../api/taskApi';
import '../styles/TokenTaskDetail.css';

interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  tokenAddress?: string;
  tokenAmount?: number;
  maxParticipants?: number;
  currentParticipants?: number;
}

const TokenTaskDetail: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchTask(parseInt(taskId));
    }
  }, [taskId]);

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

  const fetchTask = async (id: number) => {
    try {
      setLoading(true);
      const taskData = await taskApi.getTaskDetails(id);
      setTask(taskData);
      if (taskData.tokenAddress && taskData.tokenAmount && user?.walletAddress) {
        checkTokenOwnership(taskData.tokenAddress, taskData.tokenAmount, user.walletAddress);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage('Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
  };

  const checkTokenOwnership = async (tokenAddress: string, requiredAmount: number, walletAddress: string) => {
    try {
      const balance = await taskApi.getBalance(user?.id || '');
      setOwnsToken(parseFloat(balance) >= requiredAmount);
    } catch (error) {
      console.error('Error checking token ownership:', error);
      setOwnsToken(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !user) return;

    try {
      const response = await taskApi.completeTask(task.id, user.id);
      setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
      setTask({ ...task, completed: true });
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Произошла ошибка при выполнении задания');
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
      <h1>{task.title}</h1>
      <p className="description">{task.description}</p>
      <div className="task-info">
        <p className="reward">Награда: {task.reward}</p>
        <p className="token-amount">Требуемое количество токенов: {task.tokenAmount}</p>
        <p className="progress">Прогресс: {task.currentParticipants}/{task.maxParticipants}</p>
      </div>
      <div className="task-requirements">
        <p>Требования:</p>
        <ul>
          <li className={ownsToken ? 'completed' : ''}>
            Иметь {task.tokenAmount} токенов на балансе
          </li>
        </ul>
      </div>
      <button 
        className="complete-button"
        onClick={handleCompleteTask} 
        disabled={!ownsToken || task.completed}
      >
        {task.completed ? 'Задание выполнено' : 'Выполнить задание'}
      </button>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;