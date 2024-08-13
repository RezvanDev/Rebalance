import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/reducers';
import { fetchTasksAction, completeTaskAction } from '../redux/store/actions/taskActions';
import { TaskType } from '../types/task';
import TaskCard from './TaskCard';
import LoadingSpinner from './LoadingSpinner';
import '../styles/ChannelTasks.css';

const ChannelTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchTasksAction(TaskType.CHANNEL));
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

  const handleTaskClick = async (taskId: number) => {
    const task = tasks && tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      try {
        await dispatch(completeTaskAction(taskId));
      } catch (error) {
        console.error('Error completing task:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTasksAction(TaskType.CHANNEL));
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">Ошибка при загрузке заданий: {error}</div>;
  }

  const channelTasks = tasks && tasks.length > 0 ? tasks.filter(task => task.type === TaskType.CHANNEL) : [];

  if (channelTasks.length === 0) {
    return (
      <div className="channel-tasks-container">
        <div className="channel-tasks-header">
          <h1>Задания по каналам</h1>
          <button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
        <div className="no-tasks-message">Нет доступных заданий по каналам</div>
      </div>
    );
  }

  return (
    <div className="channel-tasks-container">
      <div className="channel-tasks-header">
        <h1>Задания по каналам</h1>
        <button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Обновление...' : 'Обновить'}
        </button>
      </div>
      <div className="channel-list">
        {channelTasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
        ))}
      </div>
    </div>
  );
};

export default ChannelTasks;