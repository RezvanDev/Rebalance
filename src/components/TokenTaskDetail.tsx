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
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
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

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const response = await taskApi.getTask(parseInt(taskId));
      setTask(response.task);
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage('Ошибка при загрузке задания');
    } finally {
      setLoading(false);
    }
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
    if (!task || !user) return;

    try {
      const response = await taskApi.completeTask(task.id, user.id);
      if (response.success) {
        setMessage(`Поздравляем! Вы выполнили задание и получили ${task.reward}!`);
        setTask({ ...task, completed: true });
      } else {
        setMessage(response.error || 'Произошла ошибка при выполнении задания');
      }
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
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TokenTaskDetail;