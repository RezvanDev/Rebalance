import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import ChannelTaskCard from '../card/ChannelTaskCard';
import { useBalance } from '../hooks/useBalance';
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
  const { updateBalance, balance } = useBalance();
  const { addTransaction } = useTransactions();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannelTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/tasks', { params: { type: 'CHANNEL' } });
      console.log('API response:', response.data);
      if (response.data && Array.isArray(response.data.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
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
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (err: any) {
      console.error('Error fetching channel tasks:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке заданий по каналам');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChannelTasks();
  }, [fetchChannelTasks]);

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

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubscribe = async (id: number) => {
    const channel = channels.find(c => c.id === id);
    if (channel && user) {
      try {
        const completeResponse = await api.post(`/tasks/${id}/complete`, { telegramId: user.id });
  
        if (completeResponse.data.success) {
          const rewardAmount = parseInt(channel.reward.split(' ')[0]);
          const newBalance = await updateBalance(rewardAmount, 'add');
          
          if (newBalance !== null) {
            addTransaction({
              type: 'Получение',
              amount: `${rewardAmount} LIBRA`,
              description: `Подписка на канал ${channel.name}`
            });
  
            showMessage(`Вы получили ${channel.reward} за подписку на ${channel.name}!`);
            
            setChannels(prevChannels => prevChannels.filter(c => c.id !== id));
            
            const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
            completedTasks.push(id);
            localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
  
            // Обновляем баланс в интерфейсе
            updateBalance(newBalance, 'set');
          } else {
            showMessage('Ошибка при обновлении баланса. Пожалуйста, попробуйте еще раз.');
          }
        } else {
          showMessage(completeResponse.data.error || 'Произошла ошибка при выполнении задания.');
        }
      } catch (error: any) {
        console.error('Error completing channel task:', error);
        showMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const handleRefresh = () => {
    showMessage('Обновление списка каналов...');
    fetchChannelTasks();
  };

  if (loading) {
    return <div className="loading">Загрузка заданий по каналам...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="channel-tasks-container">
      {message && <div className="message">{message}</div>}
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
        <div className="no-tasks">Нет доступных заданий по каналам</div>
      )}
    </div>
  );
};

export default ChannelTasks;