import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from "../context/TelegramContext";
import axios from 'axios';
import '../styles/TasksPage.css';

const API_URL = 'https://f2a6-202-79-184-241.ngrok-free.app/api'; // Замените на ваш реальный URL API

interface Task {
  id: number;
  type: 'CHANNEL' | 'TOKEN';
  title: string;
  reward: string;
}

const TasksPage: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const [academyCompleted, setAcademyCompleted] = useState(false);
  const [channelTasksCount, setChannelTasksCount] = useState<number | null>(null);
  const [tokenTasksCount, setTokenTasksCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isCompleted = localStorage.getItem('academyCompleted') === 'true';
    setAcademyCompleted(isCompleted);
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

  const handleAcademyClick = () => {
    navigate('/reba-academy');
  };

  const fetchTasks = async (type: 'CHANNEL' | 'TOKEN') => {
    try {
      const response = await axios.get(`${API_URL}/tasks?type=${type}`);
      if (response.data && Array.isArray(response.data.tasks)) {
        return response.data.tasks.length;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`Error fetching ${type} tasks:`, error);
      setError(`Failed to load ${type.toLowerCase()} tasks. Please try again.`);
      return null;
    }
  };

  const handleChannelTasksClick = async () => {
    if (academyCompleted) {
      const count = await fetchTasks('CHANNEL');
      setChannelTasksCount(count);
      if (count !== null) {
        navigate('/channel-tasks');
      }
    }
  };

  const handleTokenTasksClick = async () => {
    if (academyCompleted) {
      const count = await fetchTasks('TOKEN');
      setTokenTasksCount(count);
      if (count !== null) {
        navigate('/token-tasks');
      }
    }
  };

  const handleTaskClick = (taskType: string) => {
    if (academyCompleted) {
      switch (taskType) {
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

  return (
    <div className="tasks-container">
      <h1 className="tasks-title">Выполняйте задания и получайте токены</h1>
      {error && <div className="error-message">{error}</div>}
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
          onClick={handleChannelTasksClick}
        >
          <span className="task-name">Задания по каналам</span>
          <span className="task-count">{channelTasksCount !== null ? channelTasksCount : '...'} &gt;</span>
        </div>
        <div
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={handleTokenTasksClick}
        >
          <span className="task-name">Задания по токенам</span>
          <span className="task-count">{tokenTasksCount !== null ? tokenTasksCount : '...'} &gt;</span>
        </div>
        <div
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('staking')}
        >
          <span className="task-name">Задания по стейкингу</span>
          <span className="task-count">5 &gt;</span>
        </div>
        <div
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('farming')}
        >
          <span className="task-name">Задания по фармингу</span>
          <span className="task-count">5 &gt;</span>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;