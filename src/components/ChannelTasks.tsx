import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import ChannelTaskCard from '../card/ChannelTaskCard';
import { useUserBalance } from '../hooks/useUserBalance';
import { useTransactions } from '../hooks/useTransactions';
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
  const { addToBalance } = useUserBalance();
  const { addTransaction } = useTransactions();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/channels`);
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const channelsData = await response.json();
        setChannels(channelsData);
      } catch (error) {
        console.error('Error fetching channels:', error);
        showMessage('Ошибка при загрузке каналов');
      }
    };
    fetchChannels();
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

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubscribe = async (id: number) => {
    if (!user?.id) {
      console.error('User ID is not available');
      showMessage('Ошибка: ID пользователя недоступен');
      return;
    }

    const channel = channels.find(c => c.id === id);
    if (channel) {
      const rewardAmount = parseInt(channel.reward.split(' ')[0]);
      
      try {
        // Проверка подписки на канал
        const checkResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/channels/check-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, channelUsername: channel.channelLink.split('/').pop() })
        });
        const { isSubscribed } = await checkResponse.json();

        if (!isSubscribed) {
          showMessage(`Пожалуйста, подпишитесь на канал ${channel.name} для получения награды`);
          return;
        }

        // Обновление баланса
        await addToBalance(rewardAmount, true);
        
        // Добавление транзакции
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Подписка на канал ${channel.name}`
        });
    
        // Отправка информации о подписке на бэкенд
        await fetch(`${import.meta.env.VITE_API_URL}/api/channels/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, channelId: id })
        });
    
        showMessage(`Вы получили ${channel.reward} за подписку на ${channel.name}!`);
    
        setChannels(prevChannels => prevChannels.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error updating balance and subscribing:', error);
        showMessage('Произошла ошибка при обновлении баланса');
      }
    }
  };

  const handleRefresh = async () => {
    showMessage('Обновление списка каналов...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/channels`);
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      const channelsData = await response.json();
      setChannels(channelsData);
      showMessage('Список каналов обновлен');
    } catch (error) {
      console.error('Error refreshing channels:', error);
      showMessage('Ошибка при обновлении списка каналов');
    }
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="channel-tasks-container">
      {message && <div className="message">{message}</div>}
      <div className="channel-tasks-header">
        <h1>Задания по каналам</h1>
        <p>Подпишитесь на каналы, чтобы получить бонусы</p>
        <button className="refresh-button" onClick={handleRefresh}>↻</button>
      </div>
      <div className="channel-list">
        {channels.map((channel) => (
          <ChannelTaskCard
            key={channel.id}
            {...channel}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    </div>
  );
};

export default ChannelTasks;