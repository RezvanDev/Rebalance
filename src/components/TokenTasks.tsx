import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import api from '../utils/api';
import "../styles/TokenTasks.css";

interface TokenTask {
  id: number;
  title: string;
  description: string;
  reward: string;
  channelUsername: string;
  tokenAddress: string;
  tokenAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  completed: boolean;
}

const TokenTasks: React.FC = () => {
  const { tg, user } = useTelegram();
  const navigate = useNavigate();
  const { balance, fetchBalance } = useBalance();
  const { addTransaction } = useTransactions();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<TokenTask | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/tasks', { params: { type: 'TOKEN' } });
      if (response.data && Array.isArray(response.data.tasks)) {
        setTasks(response.data.tasks);
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (err: any) {
      console.error('Error fetching token tasks:', err);
      setMessage(err.response?.data?.error || 'Ошибка при загрузке заданий по токенам');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (tg && tg.BackButton) {
      if (selectedTask) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => setSelectedTask(null));
      } else {
        tg.BackButton.hide();
      }
    }
    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, selectedTask]);

  const handleTaskClick = (task: TokenTask) => {
    setSelectedTask(task);
    checkSubscription(task.channelUsername);
  };

  const checkSubscription = async (channelUsername: string) => {
    try {
      const response = await api.get('/telegram/check-subscription', {
        params: { telegramId: user?.id, channelUsername }
      });
      setIsSubscribed(response.data.isSubscribed);
    } catch (error) {
      console.error('Error checking channel subscription:', error);
      setIsSubscribed(false);
    }
  };

  const handleSubscribe = () => {
    if (selectedTask?.channelUsername) {
      window.open(`https://t.me/${selectedTask.channelUsername}`, '_blank');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask || !user) return;

    try {
      if (!isSubscribed) {
        setMessage('Пожалуйста, подпишитесь на канал перед выполнением задания');
        return;
      }

      const completeResponse = await api.post(`/tasks/${selectedTask.id}/complete`, { telegramId: user.id });

      if (completeResponse.data.success) {
        const rewardAmount = Number(selectedTask.reward.split(' ')[0]);
        await fetchBalance();
        
        addTransaction({
          type: 'Получение',
          amount: `${rewardAmount} LIBRA`,
          description: `Выполнение задания ${selectedTask.title}`
        });

        setMessage(`Поздравляем! Вы выполнили задание и получили ${selectedTask.reward}!`);
        setTasks(tasks.map(task => 
          task.id === selectedTask.id ? { ...task, completed: true } : task
        ));
        setSelectedTask({ ...selectedTask, completed: true });
        setTimeout(() => setSelectedTask(null), 3000);
      } else {
        setMessage(completeResponse.data.error || 'Произошла ошибка при выполнении задания');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      setMessage(error.response?.data?.error || 'Произошла ошибка при выполнении задания');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка заданий по токенам...</div>;
  }

  if (selectedTask) {
    return (
      <div className="token-task-detail">
        <h1 className="task-name">{selectedTask.title}</h1>
        <p className="task-description">{selectedTask.description}</p>
        <div className="info-card">
          <h2>Награда</h2>
          <p className="reward">{selectedTask.reward}</p>
        </div>
        <div className="info-card">
          <h2>Выполнили</h2>
          <p className="progress">{selectedTask.currentParticipants} из {selectedTask.maxParticipants}</p>
          <p className="progress-note">В этом задании ограниченное количество участников</p>
        </div>
        <div className="info-card">
          <h2>Задание</h2>
          <div className="task-step" onClick={handleSubscribe}>
            <p>1. Подписаться на канал @{selectedTask.channelUsername}</p>
            {isSubscribed ? <span className="completed">✓</span> : <span className="arrow">›</span>}
          </div>
          <div className="task-step">
            <p>2. Иметь {selectedTask.tokenAmount} токенов на балансе</p>
            <span className="completed">✓</span>
          </div>
        </div>
        <button 
          className="complete-button"
          onClick={handleCompleteTask} 
          disabled={selectedTask.completed || !isSubscribed}
        >
          {selectedTask.completed ? 'Задание выполнено' : 'Выполнить задание'}
        </button>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  return (
    <div className="token-tasks-container">
      <div className="token-tasks-header">
        <h1>Задания по токенам</h1>
        <p>Выполните задания, чтобы получить бонусы</p>
        <p>Текущий баланс: {balance} LIBRA</p>
      </div>
      {tasks.length > 0 ? (
        <div className="token-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`token-item ${task.completed ? 'completed' : ''}`}
              onClick={() => handleTaskClick(task)}
            >
              <div className="token-icon">₭</div>
              <div className="token-info">
                <span className="token-name">{task.title}</span>
                <span className="token-reward">{task.reward}</span>
              </div>
              {task.completed ? (
                <span className="completed-icon">✓</span>
              ) : (
                <span className="arrow-icon">›</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-tasks">Нет доступных заданий по токенам</div>
      )}
    </div>
  );
};

export default TokenTasks;