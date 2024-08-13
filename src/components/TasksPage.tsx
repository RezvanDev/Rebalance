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
  reward: string;
  completed: boolean;
}

const TasksPage: React.FC = () => {
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

  if (loading) {
    return <div>Загрузка заданий...</div>;
  }

  if (error) {
    return <div>Ошибка при загрузке заданий: {error}</div>;
  }

  const channelTasks = tasks.filter(task => task.type === 'CHANNEL');
  const tokenTasks = tasks.filter(task => task.type === 'TOKEN');

  return (
    <div className="tasks-page-container">
      <h1>Задания</h1>
      <div className="task-types">
        <div className="task-type" onClick={() => navigate('/channel-tasks')}>
          <h2>Задания по каналам</h2>
          <p>{channelTasks.length} заданий</p>
        </div>
        <div className="task-type" onClick={() => navigate('/token-tasks')}>
          <h2>Задания по токенам</h2>
          <p>{tokenTasks.length} заданий</p>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;