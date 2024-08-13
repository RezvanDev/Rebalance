import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';
import '../styles/TokenTasks.css';

interface Task {
  id: number;
  title: string;
  reward: string;
  completed: boolean;
}

const TokenTasks: React.FC = () => {
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
      const response = await axios.get(`${BASE_URL}/api/tasks`, { params: { type: 'TOKEN' } });
      setTasks(response.data.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Ошибка при загрузке заданий');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/token-task/${taskId}`);
  };

  if (loading) {
    return <div>Загрузка заданий...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (tasks.length === 0) {
    return <div>Нет доступных заданий по токенам</div>;
  }

  return (
    <div className="token-tasks-container">
      <div className="token-tasks-header">
        <h1>Задания по токенам</h1>
        <button onClick={fetchTasks}>Обновить</button>
      </div>
      <div className="token-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`token-item ${task.completed ? 'completed' : ''}`}
            onClick={() => handleTaskClick(task.id)}
          >
            <div className="token-icon">₭</div>
            <div className="token-info">
              <span className="token-name">{task.title}</span>
              <span className="token-reward">{task.reward}</span>
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

export default TokenTasks;