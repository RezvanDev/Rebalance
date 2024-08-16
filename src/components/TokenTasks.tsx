import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import api from '../utils/api';
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
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching token tasks...');
      const response = await api.get('/tasks', { params: { type: 'TOKEN' } });
      console.log('Token tasks response:', response.data);

      if (response.data && Array.isArray(response.data.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user?.id}`) || '[]');
        const tokenTasks = response.data.tasks.map((task: TokenTask) => ({
          ...task,
          completed: completedTasks.includes(task.id)
        }));
        setTasks(tokenTasks);
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (err: any) {
      console.error('Error fetching token tasks:', err);
      setError(err.response?.data?.error || err.message || 'Ошибка при загрузке заданий по токенам');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  const handleTaskClick = (taskId: number) => {
    navigate(`/token-task/${taskId}`);
  };

  if (loading) {
    return <div className="loading">Загрузка заданий по токенам...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={fetchTasks}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="token-tasks-container">
      <h1>Задания по токенам</h1>
      {tasks.length > 0 ? (
        <div className="token-list">
          {tasks.filter(task => !task.completed).map((task) => (
            <div
              key={task.id}
              className="token-item"
              onClick={() => handleTaskClick(task.id)}
            >
              <span className="token-name">{task.title}</span>
              <span className="token-reward">{task.reward}</span>
              <span className="token-amount">Требуется: {task.tokenAmount} токенов</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-tasks">Нет доступных заданий по токенам</p>
      )}
    </div>
  );
};

export default TokenTasks;