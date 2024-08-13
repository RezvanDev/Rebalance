import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';

interface TaskForm {
  type: 'CHANNEL' | 'TOKEN';
  title: string;
  description: string;
  reward: string;
  channelUsername: string;
  tokenAddress: string;
  tokenAmount: string;
  maxParticipants: string;
}

const AdminTaskCreation: React.FC = () => {
  const [task, setTask] = useState<TaskForm>({
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
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/tasks`, task);
      alert('Задание успешно создано!');
      console.log(response.data);
      // Очистка формы после успешного создания
      setTask({
        type: 'CHANNEL',
        title: '',
        description: '',
        reward: '',
        channelUsername: '',
        tokenAddress: '',
        tokenAmount: '',
        maxParticipants: ''
      });
    } catch (error) {
      console.error('Ошибка при создании задания:', error);
      alert('Произошла ошибка при создании задания');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создание нового задания</h2>
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
          required
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
            required
          />
          <input
            type="text"
            name="tokenAmount"
            value={task.tokenAmount}
            onChange={handleChange}
            placeholder="Количество токенов"
            required
          />
        </>
      )}
      <input
        type="number"
        name="maxParticipants"
        value={task.maxParticipants}
        onChange={handleChange}
        placeholder="Максимальное количество участников"
        required
      />
      <button type="submit">Создать задание</button>
    </form>
  );
};

export default AdminTaskCreation;