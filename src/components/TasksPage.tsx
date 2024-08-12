import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from "../context/TelegramContext";
import '../styles/TasksPage.css';

const TasksPage: React.FC = () => {
  const { tg } = useTelegram();
  const navigate = useNavigate();
  const [academyCompleted, setAcademyCompleted] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem('academyCompleted') === 'true';
    setAcademyCompleted(isCompleted);
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/main-menu'));
    }
    return () => {
      if (tg) {
        tg.BackButton.offClick();
      }
    };
  }, [tg, navigate]);

  const handleAcademyClick = () => {
    navigate('/reba-academy');
  };

  const handleTaskClick = (taskType: string) => {
    if (academyCompleted) {
      switch (taskType) {
        case 'channels':
          navigate('/channel-tasks');
          break;
        case 'tokens':
          navigate('/token-tasks');
          break;
        case 'staking':
          navigate('/staking-tasks');
          break;
        case 'farming':
          navigate('/farming-tasks');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="tasks-container">
      <h1 className="tasks-title">Выполняйте задания и получайте токены</h1>
      <div className="task-section" onClick={handleAcademyClick}>
        <div className="task-header">
          <h2 className="section-title">База – Академия REBA</h2>
          {academyCompleted && <span className="completed-icon">✅</span>}
        </div>
        <p className="section-description">
          {academyCompleted
            ? "Академия пройдена. Нажмите, чтобы повторить."
            : "Для доступа к заданиям, сперва необходимо пройти академию"}
        </p>
      </div>
      <div className="task-list">
        <div 
          className={`task-item ${!academyCompleted && 'disabled'}`} 
          onClick={() => handleTaskClick('channels')}
        >
          <span className="task-name">Задания по каналам</span>
          <span className="task-count">5 &gt;</span>
        </div>
        <div 
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('tokens')}
        >
          <span className="task-name">Задания по токенам</span>
          <span className="task-count">5 &gt;</span>
        </div>
        <div 
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('staking')}
        >
          <span className="task-name">Задания по стейкингу</span>
          <span className="task-count">5 &gt;</span>
        </div>
        <div 
          className={`task-item ${!academyCompleted && 'disabled'}`}
          onClick={() => handleTaskClick('farming')}
        >
          <span className="task-name">Задания по фармингу</span>
          <span className="task-count">5 &gt;</span>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;