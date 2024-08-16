import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/UniversalTaskCard.css';

interface TaskCardProps {
  id: number;
  title: string;
  reward: string;
  completed: boolean;
  type: 'CHANNEL' | 'TOKEN';
  channelUsername?: string;
  tokenAddress?: string;
  tokenAmount?: number;
  maxParticipants?: number;
  currentParticipants?: number;
  onSubscribe?: (id: number) => void;
}

const UniversalTaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  reward,
  completed,
  type,
  channelUsername,
  tokenAddress,
  tokenAmount,
  maxParticipants,
  currentParticipants,
  onSubscribe
}) => {
  const renderTaskSpecificInfo = () => {
    if (type === 'CHANNEL') {
      return (
        <div className="channel-info">
          <p>Канал: @{channelUsername}</p>
        </div>
      );
    } else if (type === 'TOKEN') {
      return (
        <div className="token-info">
          <p>Требуемые токены: {tokenAmount}</p>
          <p>Прогресс: {currentParticipants}/{maxParticipants}</p>
        </div>
      );
    }
  };

  return (
    <div className={`universal-task-card ${completed ? 'completed' : ''}`}>
      <h3>{title}</h3>
      <p className="reward">Награда: {reward}</p>
      {renderTaskSpecificInfo()}
      <div className="card-actions">
        {type === 'CHANNEL' && !completed && (
          <button onClick={() => onSubscribe && onSubscribe(id)} className="subscribe-button">
            Подписаться
          </button>
        )}
        <Link to={`/task/${type.toLowerCase()}/${id}`} className="details-link">
          Подробнее
        </Link>
      </div>
    </div>
  );
};

export default UniversalTaskCard;