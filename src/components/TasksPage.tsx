import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/reducers';
import { fetchTasksAction } from '../redux/store/actions/taskActions';
import { TaskType } from '../types/task';
import '../styles/TasksPage.css';

const TasksPage: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasksAction(TaskType.CHANNEL));
    dispatch(fetchTasksAction(TaskType.TOKEN));
  }, [dispatch]);

  useEffect(() => {
    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/main-menu'));
    }
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  if (loading) {
    return <div>Загрузка заданий...</div>;
  }

  if (error) {
    return <div>Ошибка при загрузке заданий: {error}</div>;
  }

  return (
    <div className="tasks-page-container">
      <h1>Задания</h1>
      <div className="task-types">
        <div className="task-type" onClick={() => navigate('/channel-tasks')}>
          <h2>Задания по каналам</h2>
          <p>{tasks.filter(task => task.type === TaskType.CHANNEL).length} заданий</p>
        </div>
        <div className="task-type" onClick={() => navigate('/token-tasks')}>
          <h2>Задания по токенам</h2>
          <p>{tasks.filter(task => task.type === TaskType.TOKEN).length} заданий</p>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;