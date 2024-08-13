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
  title: string;
  reward: string;
  completed: boolean;
  link: string;
  channelUsername: string;
}

const ChannelTasks: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { addTransaction } = useTransactions();
  const [message, setMessage] = useState<string | null>(null);
  const { fetchTask } = useActions();
  const { userData } = useTypeSelector((state) => state.user);
  const { tasks, loading, error } = useTypeSelector((state) => state.tasks);

  const completeTask = async (id: number) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/tasks/${id}/complete`,
        null,
        {
          params: {
            telegramId: user.telegramId,
          },
        }
      );
      console.log("Task completion response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("Fetching channel tasks...");
    fetchTask("CHANNEL");
  }, [fetchTask]);

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

  const handleSubscribe = async (id: number) => {
    const channel = tasks.find((c) => c.id === id) as Channel;

    if (channel) {
      try {
        await completeTask(id);
        addTransaction({
          type: "Получение",
          amount: `${channel.reward} LIBRA`,
          description: `Подписка на канал ${channel.title}`,
        });
        showMessage(
          `Вы получили ${channel.reward} за подписку на ${channel.title}!`
        );
        // Обновляем список задач после выполнения
        fetchTask("CHANNEL");
      } catch (error) {
        console.error("Error subscribing to channel:", error);
        showMessage("Произошла ошибка при выполнении задания");
      }
    }
  };

  const handleRefresh = () => {
    showMessage("Обновление списка каналов...");
    fetchTask("CHANNEL");
  };

  if (loading) {
    return <div>Загрузка заданий...</div>;
  }

  if (error) {
    return <div>Ошибка при загрузке заданий: {error}</div>;
  }

  if (tasks.length === 0) {
    return <div>Нет доступных заданий по каналам</div>;
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