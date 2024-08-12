import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import TokenTaskCard from '../card/TokenTaskCard';
import { tokenTasks } from '../config/tokenTasks';
import '../styles/TokenTasks.css';
import { useActions } from '../hooks/useActions';
import { useTypeSelector } from '../hooks/useTypeSelector';

const TokenTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const { fetchTask } = useActions();
  const { tasks } = useTypeSelector((state) => state.tasks);

  useEffect(() => {
    fetchTask("TOKEN");
  }, []);

  React.useEffect(() => {
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