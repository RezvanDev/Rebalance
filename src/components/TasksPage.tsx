import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from "../context/TelegramContext";
import axios from 'axios';
import '../styles/TasksPage.css';

const API_URL = 'https://f2a6-202-79-184-241.ngrok-free.app/api'; // Замените на актуальный URL вашего API

interface Task {
  id: number;
  type: 'CHANNEL' | 'TOKEN';
  name: string;
  reward: string;
  description: string;
}

const TasksPage: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const [academyCompleted, setAcademyCompleted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isCompleted = localStorage.getItem('academyCompleted') === 'true';
    setAcademyCompleted(isCompleted);
    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/main-menu'));
    }
    fetchTasks();
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      console.log('API response:', response.data); // Для отладки
      if (response.data && Array.isArray(response.data.tasks)) {
        setTasks(response.data.tasks);
      } else {
        throw new Error('Received data is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcademyClick = () => {
    navigate('/reba-academy');
  };

  const handleTaskClick = (taskType: string) => {
    if (academyCompleted) {
      switch (taskType) {
        case 'channels':
          navigate('/channel-tasks');
          break;
        case 'tokens':
          navigate('/token-tasks');
          break;
        case 'staking':
          navigate('/staking-tasks');
          break;
        case 'farming':
          navigate('/farming-tasks');
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="tasks-container">
      <h1 className="tasks-title">Выполняйте задания и получайте токены</h1>
      <div className="task-section" onClick={handleAcademyClick}>
        <div className="task-header">
          <h2 className="section-title">База – Академия REBA</h2>
          {academyCompleted && <span className="completed-icon">✅</span>}
        </div>
        <p className="section-description">
          {academyCompleted
            ? "Академия пройдена. Нажмите, чтобы повторить."
            : "Для доступа к заданиям, сперва необходимо пройти академию"}
        </p>
      </div>
      <div className="task-list">
        <div
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('channels')}
        >
          <span className="task-name">Задания по каналам</span>
          <span className="task-count">{tasks.filter(task => task.type === 'CHANNEL').length} &gt;</span>
        </div>
        <div
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('tokens')}
        >
          <span className="task-name">Задания по токенам</span>
          <span className="task-count">{tasks.filter(task => task.type === 'TOKEN').length} &gt;</span>
        </div>
        <div
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('staking')}
        >
          <span className="task-name">Задания по стейкингу</span>
          <span className="task-count">0 &gt;</span>
        </div>
        <div
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('farming')}
        >
          <span className="task-name">Задания по фармингу</span>
          <span className="task-count">0 &gt;</span>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;