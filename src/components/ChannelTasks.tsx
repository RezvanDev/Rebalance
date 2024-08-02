import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import ChannelTaskCard from '../card/ChannelTaskCard';
import { useUserBalance } from '../hooks/useUserBalance';
import { useBalance } from '../context/BalanceContext';
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
  const { updateChannelRewards } = useBalance();
  const { addTransaction } = useTransactions();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initialChannels = [
      { id: 1, name: 'Канал №1', reward: '100 LIBRA', completed: false, link: '/channel/1', channelLink: 'https://t.me/devrezvan' },
      { id: 2, name: 'Канал №2', reward: '150 LIBRA', completed: false, link: '/channel/2', channelLink: 'https://t.me/channel2' },
      { id: 3, name: 'Канал №3', reward: '200 LIBRA', completed: false, link: '/channel/3', channelLink: 'https://t.me/channel3' },
      { id: 4, name: 'Канал №4', reward: '120 LIBRA', completed: false, link: '/channel/4', channelLink: 'https://t.me/channel4' },
      { id: 5, name: 'Канал №5', reward: '180 LIBRA', completed: false, link: '/channel/5', channelLink: 'https://t.me/channel5' },
    ];
    if (user) {
      const completedChannels = JSON.parse(localStorage.getItem(`completedChannels_${user.id}`) || '[]');
      const filteredChannels = initialChannels.filter(channel => !completedChannels.includes(channel.id));
      setChannels(filteredChannels);
    } else {
      setChannels(initialChannels);
    }
  }, [user]);

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

  const handleSubscribe = (id: number) => {
    const channel = channels.find(c => c.id === id);
    if (channel && user) {
      const rewardAmount = parseInt(channel.reward.split(' ')[0]);
      addToBalance(rewardAmount);
      updateChannelRewards(rewardAmount);
      
      // Добавляем транзакцию
      addTransaction({
        type: 'Получение',
        amount: `${rewardAmount} LIBRA`,
        description: `Подписка на канал ${channel.name}`
      });

      showMessage(`Вы получили ${channel.reward} за подписку на ${channel.name}!`);
      
      // Сохраняем ID выполненного задания в localStorage
      const completedChannels = JSON.parse(localStorage.getItem(`completedChannels_${user.id}`) || '[]');
      completedChannels.push(id);
      localStorage.setItem(`completedChannels_${user.id}`, JSON.stringify(completedChannels));
      
      // Удаляем канал из списка
      setChannels(prevChannels => prevChannels.filter(c => c.id !== id));
    }
  };

  const handleRefresh = () => {
    showMessage('Обновление списка каналов...');
    // Здесь можно добавить логику для обновления списка каналов
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