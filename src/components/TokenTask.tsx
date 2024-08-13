import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import TokenTaskCard from '../card/TokenTaskCard';
import '../styles/TokenTasks.css';
import { useActions } from '../hooks/useActions';
import { useTypeSelector } from '../hooks/useTypeSelector';
import { completeTask } from '../api/taskApi';

const TokenTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const { fetchTask } = useActions();
  const { tasks, loading, error } = useTypeSelector((state) => state.tasks);

  useEffect(() => {
    fetchTask("TOKEN");
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

  const handleTaskAction = async (taskId: number) => {
    try {
      await completeTask(taskId);
      fetchTask("TOKEN"); // Обновляем список задач
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading) {
    return <div>Загрузка заданий...</div>;
  }

  if (error) {
    return <div>Ошибка при загрузке заданий: {error}</div>;
  }

  if (tasks.length === 0) {
    return <div>Нет доступных заданий по токенам</div>;
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
            completed={task.completed}
            onAction={handleTaskAction}
          />
        ))}
      </div>
    </div>
  );
};

export default TokenTasks;