import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { taskApi } from '../api/taskApi';
import UniversalTaskCard from './UniversalTaskCard';
import '../styles/TokenTasks.css';

interface TokenTask {
  id: number;
  title: string;
  description: string;
  reward: string;
  tokenAddress: string;
  tokenAmount: number;
  maxParticipants?: number;
  currentParticipants?: number;
  completed: boolean;
  channelUsername?: string;
  type: 'TOKEN';
}

const TokenTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId?: string }>();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<TokenTask | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ownsToken, setOwnsToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (taskId) {
      const task = tasks.find(t => t.id === parseInt(taskId));
      if (task) {
        setSelectedTask(task);
        checkRequirements(task);
      }
    } else {
      setSelectedTask(null);
    }
  }, [taskId, tasks]);

  useEffect(() => {
    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/tasks'));
    }
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks('TOKEN');
      if (response && Array.isArray(response.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user?.id}`) || '[]');
        const tokenTasks = response.tasks.map((task: TokenTask) => ({
          ...task,
          completed: completedTasks.includes(task.id)
        }));
        setTasks(tokenTasks);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching token tasks:', err);
      setError('Ошибка при загрузке заданий по токенам');
    } finally {
      setLoading(false);
    }
  };

  const checkRequirements = async (task: TokenTask) => {
    if (task.channelUsername) {
      const subscribed = await checkChannelSubscription(task.channelUsername);
      setIsSubscribed(subscribed);
    }
    if (task.tokenAddress && task.tokenAmount) {
      const hasTokens = await checkTokenOwnership(task.tokenAddress, task.tokenAmount);
      setOwnsToken(hasTokens);
    }
  };

  const checkChannelSubscription = async (channelUsername: string): Promise<boolean> => {
    try {
      const response = await taskApi.checkChannelSubscription(user?.id || '', channelUsername);
      return response.isSubscribed;
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      return false;
    }
  };

  const checkTokenOwnership = async (tokenAddress: string, requiredAmount: number): Promise<boolean> => {
    try {
      const response = await taskApi.checkTokenOwnership(user?.walletAddress || '', tokenAddress, requiredAmount);
      return response.hasEnoughTokens;
    } catch (error) {
      console.error('Error checking token ownership:', error);
      return false;
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    if (!user) return;

    try {
      const response = await taskApi.completeTask(taskId, user.id);
      if (response.success) {
        setMessage(`Поздравляем! Вы выполнили задание и получили награду!`);
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, completed: true } : t
          )
        );
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(taskId);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
      } else {
        setMessage(response.error || 'Произошла ошибка при выполнении задания');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Произошла ошибка при выполнении задания');
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/token-task/${taskId}`);
  };

  if (loading) {
    return <div className="loading">Загрузка заданий по токенам...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="token-tasks-container">
      <h1>Задания по токенам</h1>
      {selectedTask ? (
        <div className="token-task-detail">
          <UniversalTaskCard
            {...selectedTask}
            onSubscribe={() => {}} // Для токен-заданий подписка не требуется
          />
          <div className="task-description">
            <h2>Описание задания</h2>
            <p>{selectedTask.description}</p>
          </div>
          <div className="task-requirements">
            <h2>Требования</h2>
            <ul>
              {selectedTask.channelUsername && (
                <li className={isSubscribed ? 'completed' : ''}>
                  Подписаться на канал @{selectedTask.channelUsername}
                </li>
              )}
              {selectedTask.tokenAmount && (
                <li className={ownsToken ? 'completed' : ''}>
                  Иметь {selectedTask.tokenAmount} токенов на балансе
                </li>
              )}
            </ul>
          </div>
          <button 
            className="complete-button"
            onClick={() => handleCompleteTask(selectedTask.id)} 
            disabled={!isSubscribed || !ownsToken || selectedTask.completed}
          >
            {selectedTask.completed ? 'Задание выполнено' : 'Выполнить задание'}
          </button>
        </div>
      ) : (
        <div className="token-list">
          {tasks.filter(task => !task.completed).map((task) => (
            <UniversalTaskCard
              key={task.id}
              {...task}
              onSubscribe={() => handleTaskClick(task.id)}
            />
          ))}
        </div>
      )}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTasks;