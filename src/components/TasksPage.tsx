import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';
import '../styles/TasksPage.css';

interface Task {
  id: number;
  type: 'CHANNEL' | 'TOKEN';
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

const TasksPage: React.FC = () => {
  const { tg, user } = useTelegram();
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
      tg.BackButton.onClick(() => navigate('/main-menu'));
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
      const response = await axios.get(`${BASE_URL}/api/tasks`);
      setTasks(response.data.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Ошибка при загрузке заданий');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.type === 'CHANNEL') {
      window.open(`https://t.me/${task.channelUsername}`, '_blank');
    } else if (task.type === 'TOKEN') {
      navigate(`/token-task/${task.id}`);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка заданий...</div>;
  }

  if (error) {
    return <div className="error">Ошибка при загрузке заданий: {error}</div>;
  }

  return (
    <div className="tasks-page-container">
      <h1>Доступные задания</h1>
      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-item" onClick={() => handleTaskClick(task)}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p className="reward">Награда: {task.reward}</p>
            {task.type === 'CHANNEL' && <p className="channel">Канал: @{task.channelUsername}</p>}
            {task.type === 'TOKEN' && (
              <>
                <p className="token-amount">Требуемое количество токенов: {task.tokenAmount}</p>
                <p className="progress">Прогресс: {task.currentParticipants}/{task.maxParticipants}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;