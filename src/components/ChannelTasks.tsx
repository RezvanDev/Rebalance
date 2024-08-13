import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';
import '../styles/ChannelTasks.css';

interface Task {
  id: number;
  title: string;
  reward: string;
  completed: boolean;
}

const ChannelTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
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
      const response = await axios.get(`${BASE_URL}/api/tasks`, { params: { type: 'CHANNEL' } });
      setTasks(response.data.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Ошибка при загрузке заданий');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = async (taskId: number) => {
    try {
      await axios.post(`${BASE_URL}/api/tasks/${taskId}/complete`);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      ));
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  if (loading) {
    return <div>Загрузка заданий...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (tasks.length === 0) {
    return <div>Нет доступных заданий по каналам</div>;
  }

  return (
    <div className="channel-tasks-container">
      <div className="channel-tasks-header">
        <h1>Задания по каналам</h1>
        <button onClick={fetchTasks}>Обновить</button>
      </div>
      <div className="channel-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`channel-item ${task.completed ? 'completed' : ''}`}
            onClick={() => !task.completed && handleTaskClick(task.id)}
          >
            <div className="channel-icon">📢</div>
            <div className="channel-info">
              <span className="channel-name">{task.title}</span>
              <span className="channel-reward">{task.reward}</span>
            </div>
            {task.completed ? (
              <span className="completed-icon">✓</span>
            ) : (
              <span className="arrow-icon">›</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelTasks;