import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import ChannelTaskCard from '../card/ChannelTaskCard';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import api from '../utils/api';
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
  const { updateBalance } = useBalance();
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
      try {
        tg.BackButton.show();
        tg.BackButton.onClick(() => navigate('/tasks'));
      } catch (error) {
        console.error('Error setting up BackButton:', error);
      }
    }
    return () => {
      if (tg && tg.BackButton) {
        try {
          tg.BackButton.offClick();
        } catch (error) {
          console.error('Error removing BackButton click handler:', error);
        }
      }
    };
  }, [tg, navigate]);

  const fetchChannelTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks?type=CHANNEL');
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
      setError('Ошибка при загрузке заданий по каналам');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubscribe = async (id) => {
    const channel = channels.find(c => c.id === id);
    if (channel && user) {
      try {
        const response = await api.post(`/tasks/${id}/complete?telegramId=${user.id}`, {});
  
        if (response.data.success) {
          const rewardAmount = parseInt(channel.reward.split(' ')[0]);
          await updateBalance(rewardAmount, 'add');
          
          addTransaction({
            type: 'Получение',
            amount: `${rewardAmount} LIBRA`,
            description: `Подписка на канал ${channel.name}`
          });
  
          showMessage(`Вы получили ${channel.reward} за подписку на ${channel.name}!`);
          
          setChannels(prevChannels => prevChannels.filter(c => c.id !== id));
        } else {
          showMessage(response.data.error || 'Произошла ошибка при выполнении задания.');
        }
      } catch (error) {
        console.error('Error completing channel task:', error);
        showMessage('Произошла ошибка при выполнении задания. Пожалуйста, попробуйте еще раз.');
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