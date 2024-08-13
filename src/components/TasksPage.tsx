import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';
import '../styles/TasksPage.css';

interface Task {
  id: number;
  type: 'CHANNEL' | 'TOKEN';
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  channelUsername?: string;
  tokenAddress?: string;
  tokenAmount?: number;
  maxParticipants?: number;
}

const TasksPage: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'CHANNEL',
    title: '',
    description: '',
    reward: '',
    channelUsername: '',
    tokenAddress: '',
    tokenAmount: undefined,
    maxParticipants: undefined
  });

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/tasks`);
      setTasks(response.data.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Ошибка при загрузке заданий');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/api/tasks`, newTask);
      setTasks([...tasks, response.data.task]);
      setShowCreateForm(false);
      setNewTask({
        type: 'CHANNEL',
        title: '',
        description: '',
        reward: '',
        channelUsername: '',
        tokenAddress: '',
        tokenAmount: undefined,
        maxParticipants: undefined
      });
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Ошибка при создании задания');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  if (loading) {
    return <div>Загрузка заданий...</div>;
  }

  if (error) {
    return <div>Ошибка при загрузке заданий: {error}</div>;
  }

  const channelTasks = tasks.filter(task => task.type === 'CHANNEL');
  const tokenTasks = tasks.filter(task => task.type === 'TOKEN');

  return (
    <div className="tasks-page-container">
      <h1>Задания</h1>
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Отменить' : 'Создать новое задание'}
      </button>
      
      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="create-task-form">
          <select name="type" value={newTask.type} onChange={handleInputChange}>
            <option value="CHANNEL">Задание по каналу</option>
            <option value="TOKEN">Задание по токену</option>
          </select>
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Название задания"
            required
          />
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Описание задания"
            required
          />
          <input
            type="text"
            name="reward"
            value={newTask.reward}
            onChange={handleInputChange}
            placeholder="Награда"
            required
          />
          {newTask.type === 'CHANNEL' && (
            <input
              type="text"
              name="channelUsername"
              value={newTask.channelUsername}
              onChange={handleInputChange}
              placeholder="Имя пользователя канала"
            />
          )}
          {newTask.type === 'TOKEN' && (
            <>
              <input
                type="text"
                name="tokenAddress"
                value={newTask.tokenAddress}
                onChange={handleInputChange}
                placeholder="Адрес токена"
              />
              <input
                type="number"
                name="tokenAmount"
                value={newTask.tokenAmount}
                onChange={handleInputChange}
                placeholder="Количество токенов"
              />
            </>
          )}
          <input
            type="number"
            name="maxParticipants"
            value={newTask.maxParticipants}
            onChange={handleInputChange}
            placeholder="Максимальное количество участников"
          />
          <button type="submit">Создать задание</button>
        </form>
      )}

      <div className="task-types">
        <div className="task-type" onClick={() => navigate('/channel-tasks')}>
          <h2>Задания по каналам</h2>
          <p>{channelTasks.length} заданий</p>
        </div>
        <div className="task-type" onClick={() => navigate('/token-tasks')}>
          <h2>Задания по токенам</h2>
          <p>{tokenTasks.length} заданий</p>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;