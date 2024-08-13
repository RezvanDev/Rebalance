import axios from 'axios';
import { BASE_URL } from '../constants/baseUrl';
import { Task, TaskType } from '../types/task';

export const fetchTasks = async (type: TaskType): Promise<Task[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/tasks`, { params: { type } });
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const completeTask = async (taskId: number): Promise<Task> => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await axios.post(`${BASE_URL}/api/tasks/${taskId}/complete`, null, {
      params: { telegramId: user.telegramId },
    });
    return response.data.task;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};