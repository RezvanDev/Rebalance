import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "../context/TelegramContext";
import ChannelTaskCard from "../card/ChannelTaskCard";
import { useTransactions } from "../hooks/useTransactions";
import "../styles/ChannelTasks.css";
import { useActions } from "../hooks/useActions";
import { useTypeSelector } from "../hooks/useTypeSelector";
import axios from "axios";
import { BASE_URL } from "../constants/baseUrl";

interface Channel {
  id: number;
  name: string;
  reward: string;
  completed: boolean;
  link: string;
  channelLink: string;
}

const ChannelTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"))
  const { addTransaction } = useTransactions();
  const [message, setMessage] = useState<string | null>(null);
  const { fetchTask } = useActions();
  const { userData } = useTypeSelector(
    (state) => state.user
  );
  const { tasks, loading } = useTypeSelector((state) => state.tasks);

  const completeTask = async (id: number) => {
    //создание пользователя
    try {
      const response = await axios
        .post(`${BASE_URL}/api/tasks/${id}/complete`, null, {
          params: {
            telegramId: user.telegramId,
          },
        })
        .then((response) => console.log(response.data))
        .catch((err) => console.log(err));

      return response;
    } catch (error) {
      console.log("Error sending wallet data:", error);
    }
  };

  useEffect(() => {
    fetchTask("CHANNEL");
  }, []);

  useEffect(() => {
    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate("/tasks"));
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
    const channel = tasks.find((c) => c.id === id);

    if (channel) {
      completeTask(id, userData.telegramId);
      addTransaction({
        type: "Получение",
        amount: `${channel} LIBRA`,
        description: `Подписка на канал ${channel.title}`,
      });
      showMessage(
        `Вы получили ${channel.reward} за подписку на ${channel.title}!`
      );
    }

    // if (channel && user) {
    //   const rewardAmount = parseInt(channel.reward.split(' ')[0]);
    //   addToBalance(rewardAmount);
    //   updateChannelRewards(rewardAmount);

    //   // Добавляем транзакцию
    //   addTransaction({
    //     type: 'Получение',
    //     amount: `${rewardAmount} LIBRA`,
    //     description: `Подписка на канал ${channel.title}`
    //   });

    //   showMessage(`Вы получили ${channel.reward} за подписку на ${channel.title}!`);

    //   // Сохраняем ID выполненного задания в localStorage
    //   const completedChannels = JSON.parse(localStorage.getItem(`completedChannels_${user.id}`) || '[]');
    //   completedChannels.push(id);
    //   localStorage.setItem(`completedChannels_${user.id}`, JSON.stringify(completedChannels));

    // Удаляем канал из списка
    // setChannels(prevChannels => prevChannels.filter(c => c.id !== id));
    // }
  };

  const handleRefresh = () => {
    showMessage("Обновление списка каналов...");
    // Здесь можно добавить логику для обновления списка каналов
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="channel-tasks-container">
      {message && <div className="message">{message}</div>}
      <div className="channel-tasks-header">
        <h1>Задания по каналам</h1>
        <p>Подпишитесь на каналы, чтобы получить бонусы</p>
        <button className="refresh-button" onClick={handleRefresh}>
          ↻
        </button>
      </div>
      <div className="channel-list">
        {tasks.map((task) => (
          <ChannelTaskCard
            key={task.id}
            {...task}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    </div>
  );
};

export default ChannelTasks;
