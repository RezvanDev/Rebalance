import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/reducers';
import { fetchTasksAction } from '../redux/store/actions/taskActions';
import { TaskType } from '../types/task';
import TaskCard from './TaskCard';
import LoadingSpinner from './LoadingSpinner';
import '../styles/TokenTasks.css';

const TokenTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchTasksAction(TaskType.TOKEN));
  }, [dispatch]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTasksAction(TaskType.TOKEN));
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">Ошибка при загрузке заданий: {error}</div>;
  }

  const tokenTasks = tasks && tasks.length > 0 ? tasks.filter(task => task.type === TaskType.TOKEN) : [];

  if (tokenTasks.length === 0) {
    return (
      <div className="token-tasks-container">
        <div className="token-tasks-header">
          <h1>Задания по токенам</h1>
          <button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
        <div className="no-tasks-message">Нет доступных заданий по токенам</div>
      </div>
    );
  }

  return (
    <div className="token-tasks-container">
      <div className="token-tasks-header">
        <h1>Задания по токенам</h1>
        <button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Обновление...' : 'Обновить'}
        </button>
      </div>
      <div className="token-list">
        {tokenTasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
        ))}
      </div>
    </div>
  );
};

export default TokenTasks;