import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import '../styles/TokenTasks.css';

interface TokenTask {
  id: number;
  title: string;
  reward: string;
  tokenAddress: string;
  tokenAmount: number;
  completed: boolean;
}

const TokenTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
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
      const response = await axios.get(`${API_URL}/tasks?type=TOKEN`);
      setTasks(response.data.tasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching token tasks:', err);
      setError('Ошибка при загрузке заданий по токенам');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/token-task/${taskId}`);
  };

  if (loading) {
    return <div>Загрузка заданий по токенам...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="token-tasks-container">
      <h1>Задания по токенам</h1>
      <div className="token-list">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`token-item ${task.completed ? 'completed' : ''}`}
            onClick={() => handleTaskClick(task.id)}
          >
            <span className="token-name">{task.title}</span>
            <span className="token-reward">{task.reward}</span>
            <span className="token-amount">Требуется: {task.tokenAmount} токенов</span>
            {task.completed && <span className="completed-icon">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenTasks;