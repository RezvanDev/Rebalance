import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import '../styles/ChannelTasks.css';

interface ChannelTask {
  id: number;
  title: string;
  reward: string;
  channelUsername: string;
  completed: boolean;
}

const ChannelTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ChannelTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

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
      const response = await axios.get(`${API_URL}/tasks?type=CHANNEL`);
      setTasks(response.data.tasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching channel tasks:', err);
      setError('Ошибка при загрузке заданий по каналам');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (taskId: number, channelUsername: string) => {
    // Здесь можно добавить логику подписки на канал
    window.open(`https://t.me/${channelUsername}`, '_blank');
    
    // После подписки отмечаем задание как выполненное
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/complete`, null, {
        params: { telegramId: user?.id }
      });
      // Обновляем список заданий
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading) {
    return <div>Загрузка заданий по каналам...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="channel-tasks-container">
      <h1>Задания по каналам</h1>
      <div className="channel-list">
        {tasks.map((task) => (
          <div key={task.id} className={`channel-item ${task.completed ? 'completed' : ''}`}>
            <span className="channel-name">{task.title}</span>
            <span className="channel-reward">{task.reward}</span>
            {!task.completed && (
              <button onClick={() => handleSubscribe(task.id, task.channelUsername)}>
                Подписаться
              </button>
            )}
            {task.completed && <span className="completed-icon">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelTasks;