import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from "../context/TelegramContext";
import axios from 'axios';
import '../styles/TasksPage.css';

const API_URL = 'https://f2a6-202-79-184-241.ngrok-free.app/api'; // Замените на URL вашего API

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
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAcademyClick = () => {
    navigate('/reba-academy');
  };

  const handleTaskClick = (taskId: number, taskType: string) => {
    if (academyCompleted) {
      navigate(`/${taskType.toLowerCase()}-task/${taskId}`);
    }
  };

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
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${!academyCompleted && 'disabled'}`}
            onClick={() => handleTaskClick(task.id, task.type)}
          >
            <span className="task-name">{task.name}</span>
            <span className="task-reward">{task.reward}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;