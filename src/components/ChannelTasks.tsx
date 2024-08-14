import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import ChannelTaskCard from '../card/ChannelTaskCard';
import { useUserBalance } from '../hooks/useUserBalance';
import { useTransactions } from '../hooks/useTransactions';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';
import "../styles/ChannelTasks.css";

interface Channel {
  id: number;
  title: string;
  reward: string;
  completed: boolean;
  channelUsername: string;
}

const ChannelTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { addToBalance } = useUserBalance();
  const { addTransaction } = useTransactions();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      const response = await axios.get(`${API_URL}/tasks?type=CHANNEL`);
      if (response.data && Array.isArray(response.data.tasks)) {
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user?.id}`) || '[]');
        const channelTasks = response.data.tasks.map((task: Channel) => ({
          ...task,
          completed: completedTasks.includes(task.id)
        }));
        setChannels(channelTasks);
      }
    } catch (error) {
      console.error('Error fetching channel tasks:', error);
      setMessage('Ошибка при загрузке заданий по каналам');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (id: number) => {
    const channel = channels.find(c => c.id === id);
    if (channel && user && !channel.completed) {
      try {
        await axios.post(`${API_URL}/tasks/${id}/complete`, null, {
          params: { telegramId: user.id }
        });

        const rewardAmount = parseInt(channel.reward);
        addToBalance(rewardAmount);
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} REBA`,
          description: `Подписка на канал ${channel.title}`
        });

        setMessage(`Вы получили ${channel.reward} за подписку на ${channel.title}!`);
        
        const completedTasks = JSON.parse(localStorage.getItem(`completedTasks_${user.id}`) || '[]');
        completedTasks.push(id);
        localStorage.setItem(`completedTasks_${user.id}`, JSON.stringify(completedTasks));
        
        setChannels(prevChannels => 
          prevChannels.map(c => c.id === id ? {...c, completed: true} : c)
        );
      } catch (error) {
        console.error('Error completing channel task:', error);
        setMessage('Произошла ошибка при выполнении задания');
      }
    }
  };

  if (loading) {
    return <div>Загрузка заданий по каналам...</div>;
  }

  return (
    <div className="channel-tasks-container">
      {message && <div className="message">{message}</div>}
      <div className="channel-tasks-header">
        <h1>Задания по каналам</h1>
        <p>Подпишитесь на каналы, чтобы получить бонусы</p>
      </div>
      <div className="channel-list">
        {channels.filter(channel => !channel.completed).map((channel) => (
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