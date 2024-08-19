import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { taskApi } from '../api/taskApi'; // Импортируем taskApi
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
      const response = await taskApi.getTasks('TOKEN');
      if (response.success && Array.isArray(response.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user?.id}`) || '[]');
        const tokenTasks = response.tasks.map((task: TokenTask) => ({
          ...task,
          completed: completedTasks.includes(task.id)
        }));
        setTasks(tokenTasks);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
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
    </div>
  );
};

export default TokenTasks;