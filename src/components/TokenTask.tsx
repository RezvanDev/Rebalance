import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import TokenTaskCard from '../card/TokenTaskCard';
import '../styles/TokenTasks.css';
import { useActions } from '../hooks/useActions';
import { useTypeSelector } from '../hooks/useTypeSelector';

const TokenTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const { fetchTask } = useActions();
  const { tasks, loading, error } = useTypeSelector((state) => state.tasks);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await fetchTask("TOKEN");
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [fetchTask]);

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

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error loading tasks: {error}</div>;
  }

  if (tasks.length === 0) {
    return <div>No tasks available at the moment.</div>;
  }

  return (
    <div className="token-tasks-container">
      <div className="token-tasks-header">
        <h1>Задания по токенам</h1>
      </div>
      <div className="token-list">
        {tasks.map((task) => (
          <TokenTaskCard
            key={task.id}
            id={task.id}
            name={task.title}
            reward={task.reward}
            link={`/token-task/${task.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TokenTasks;