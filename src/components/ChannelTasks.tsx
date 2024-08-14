import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import ChannelTaskCard from '../card/ChannelTaskCard';
import { useBalanceContext } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import "../styles/ChannelTasks.css";

interface Channel {
  id: number;
  name: string;
  reward: string;
  completed: boolean;
  link: string;
  channelLink: string;
}

const ChannelTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { updateBalance } = useBalanceContext();
  const { addTransaction } = useTransactions();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannelTasks();
  }, []);

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

  const fetchChannelTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tasks?type=CHANNEL`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('API response:', response.data);
      if (response.data && Array.isArray(response.data.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user?.id}`) || '[]');
        const channelTasks = response.data.tasks
          .filter((task: any) => !completedTasks.includes(task.id))
          .map((task: any) => ({
            id: task.id,
            name: task.title,
            reward: `${task.reward} LIBRA`,
            completed: false,
            link: `/channel/${task.id}`,
            channelLink: task.channelUsername ? `https://t.me/${task.channelUsername}` : ''
          }));
        setChannels(channelTasks);
        setError(null);
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching channel tasks:', err);
      if (axios.isAxiosError(err) && err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      setError('Ошибка при загрузке заданий по каналам');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubscribe = async (id: number) => {
    const channel = channels.find(c => c.id === id);
    if (channel && user) {
      try {
        await axios.post(`${API_URL}/tasks/${id}/complete`, null, {
          params: { telegramId: user.id }
        });

        const rewardAmount = parseInt(channel.reward.split(' ')[0]);
        await updateBalance(rewardAmount, 'add');
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Подписка на канал ${channel.name}`
        });

        showMessage(`Вы получили ${channel.reward} за подписку на ${channel.name}!`);
        
        // Сохраняем ID выполненного задания в localStorage
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(id);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
        
        // Удаляем выполненное задание из списка
        setChannels(prevChannels => prevChannels.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error completing channel task:', error);
        showMessage('Произошла ошибка при выполнении задания');
      }
    }
  };

  const handleRefresh = () => {
    showMessage('Обновление списка каналов...');
    fetchChannelTasks();
  };

  if (loading) {
    return <div>Загрузка заданий по каналам...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="channel-tasks-container">
      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}
      <div className="channel-tasks-header">
        <h1>Задания по каналам</h1>
        <p>Подпишитесь на каналы, чтобы получить бонусы</p>
        <button className="refresh-button" onClick={handleRefresh}>↻</button>
      </div>
      {channels.length > 0 ? (
        <div className="channel-list">
          {channels.map((channel) => (
            <ChannelTaskCard
              key={channel.id}
              {...channel}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      ) : (
        <div>Нет доступных заданий по каналам</div>
      )}
    </div>
  );
};

export default ChannelTasks;