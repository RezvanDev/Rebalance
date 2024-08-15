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
      const response = await axios.get(`${API_URL}/tasks`, {
        params: { type: 'TOKEN' },
        timeout: 5000 // Устанавливаем таймаут в 5 секунд
      });
      
      if (response.data && Array.isArray(response.data.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user?.id}`) || '[]');
        const tokenTasks = response.data.tasks.map((task: TokenTask) => ({
          ...task,
          completed: completedTasks.includes(task.id)
        }));
        setTasks(tokenTasks);
        setError(null);
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (err) {
      console.error('Ошибка при загрузке заданий по токенам:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('Превышено время ожидания ответа от сервера');
        } else if (err.response) {
          setError(`Ошибка сервера: ${err.response.status}`);
        } else if (err.request) {
          setError('Нет ответа от сервера');
        } else {
          setError(`Ошибка: ${err.message}`);
        }
      } else {
        setError('Произошла неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/token-task/${taskId}`);
  };

  if (loading) {
    return <div className="loading">Загрузка заданий по токенам...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchTasks}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="token-tasks-container">
      <h1>Задания по токенам</h1>
      {tasks.length === 0 ? (
        <p>Нет доступных заданий по токенам</p>
      ) : (
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
      )}
    </div>
  );
};

export default TokenTasks;