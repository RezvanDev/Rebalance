import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';
import '../styles/CreateTask.css';

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const [task, setTask] = useState({
    type: 'CHANNEL',
    title: '',
    description: '',
    reward: '',
    channelUsername: '',
    tokenAddress: '',
    tokenAmount: '',
    maxParticipants: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/api/tasks`, task);
      console.log('Task created:', response.data);
      navigate('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="create-task-container">
      <h1>Создать новое задание</h1>
      <form onSubmit={handleSubmit}>
        <select name="type" value={task.type} onChange={handleChange}>
          <option value="CHANNEL">Задание по каналу</option>
          <option value="TOKEN">Задание по токену</option>
        </select>
        <input
          type="text"
          name="title"
          value={task.title}
          onChange={handleChange}
          placeholder="Название задания"
          required
        />
        <textarea
          name="description"
          value={task.description}
          onChange={handleChange}
          placeholder="Описание задания"
          required
        />
        <input
          type="text"
          name="reward"
          value={task.reward}
          onChange={handleChange}
          placeholder="Награда"
          required
        />
        {task.type === 'CHANNEL' && (
          <input
            type="text"
            name="channelUsername"
            value={task.channelUsername}
            onChange={handleChange}
            placeholder="Имя пользователя канала"
          />
        )}
        {task.type === 'TOKEN' && (
          <>
            <input
              type="text"
              name="tokenAddress"
              value={task.tokenAddress}
              onChange={handleChange}
              placeholder="Адрес токена"
            />
            <input
              type="number"
              name="tokenAmount"
              value={task.tokenAmount}
              onChange={handleChange}
              placeholder="Количество токенов"
            />
          </>
        )}
        <input
          type="number"
          name="maxParticipants"
          value={task.maxParticipants}
          onChange={handleChange}
          placeholder="Максимальное количество участников"
        />
        <button type="submit">Создать задание</button>
      </form>
    </div>
  );
};

export default CreateTask;