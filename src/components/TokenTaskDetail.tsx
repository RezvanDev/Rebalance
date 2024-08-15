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
  const [debugMessage, setDebugMessage] = useState<string>('');

  useEffect(() => {
    console.log('Component mounted, taskId:', taskId);
    if (taskId) {
      console.log('Fetching task with id:', taskId);
      fetchTask(parseInt(taskId));
    } else {
      setDebugMessage('No taskId provided');
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
      console.log('Starting to fetch task');
      setLoading(true);
      const taskData = await taskApi.getTaskDetails(id);
      console.log('Received task data:', taskData);
      setTask(taskData);
      if (taskData.tokenAddress && taskData.tokenAmount && user?.walletAddress) {
        await checkTokenOwnership(taskData.tokenAddress, taskData.tokenAmount, user.walletAddress);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage('Ошибка при загрузке задания');
      setDebugMessage(`Error fetching task: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkTokenOwnership = async (tokenAddress: string, requiredAmount: number, walletAddress: string) => {
    try {
      console.log('Checking token ownership');
      if (!user?.id) {
        throw new Error('User ID is not available');
      }
      const balance = await taskApi.getBalance(user.id);
      console.log('User balance:', balance, 'Required amount:', requiredAmount);
      setOwnsToken(parseFloat(balance) >= requiredAmount);
    } catch (error) {
      console.error('Error checking token ownership:', error);
      setOwnsToken(false);
      setDebugMessage(`Error checking token ownership: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !user) {
      setDebugMessage('Cannot complete task: task or user is not available');
      return;
    }
    try {
      console.log('Attempting to complete task');
      const response = await taskApi.completeTask(task.id, user.id);
      console.log('Task completion response:', response);
      setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
      setTask({ ...task, completed: true });
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Произошла ошибка при выполнении задания');
      setDebugMessage(`Error completing task: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  console.log('Rendering, task:', task, 'loading:', loading);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!task) {
    return (
      <div className="error">
        <p>Задание не найдено</p>
        {debugMessage && <p className="debug-message">{debugMessage}</p>}
      </div>
    );
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
      {debugMessage && <div className="debug-message">{debugMessage}</div>}
    </div>
  );
};

export default TokenTaskDetail;