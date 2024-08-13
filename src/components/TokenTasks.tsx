import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import TokenTaskCard from '../card/TokenTaskCard';
import { tokenTasks } from '../config/tokenTasks';
import '../styles/TokenTasks.css';

const TokenTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();

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
        {tokenTasks.map((task) => (
          <TokenTaskCard
            key={task.id}
            id={task.id}
            name={task.name}
            reward={task.reward}
            link={`/token-task/${task.id}`}
            completed={false} // Здесь нужно добавить логику для определения, выполнено ли задание
          />
        ))}
      </div>
    </div>
  );
};

export default TokenTasks;