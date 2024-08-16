import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UniversalTaskCard.css';

interface UniversalTaskCardProps {
  id: number;
  type: 'CHANNEL' | 'TOKEN';
  title: string;
  reward: string;
  completed: boolean;
  channelUsername?: string;
  channelLink?: string;
  tokenAddress?: string;
  tokenAmount?: number;
  onSubscribe?: (id: number) => void;
  onClick?: (taskId: number) => void;
}

const UniversalTaskCard: React.FC<UniversalTaskCardProps> = ({
  id,
  type,
  title,
  reward,
  completed,
  channelUsername,
  channelLink,
  tokenAddress,
  tokenAmount,
  onSubscribe,
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (type === 'CHANNEL' && !completed && channelLink) {
      window.open(channelLink, '_blank');
    } else if (type === 'TOKEN' && onClick) {
      onClick(id);
    }
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'CHANNEL' && !completed && onSubscribe) {
      onSubscribe(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`universal-task-card ${completed ? 'completed' : ''} ${type.toLowerCase()}-task`}
    >
      <div className="task-icon">
        {type === 'CHANNEL' ? '📢' : '₭'}
      </div>
      <div className="task-info">
        <span className="task-name">{title}</span>
        <span className="task-reward">{reward}</span>
      </div>
      {type === 'CHANNEL' && (
        completed ? (
          <span className="completed-icon">✓</span>
        ) : (
          <button onClick={handleSubscribe} className="subscribe-button">
            Подтвердить
          </button>
        )
      )}
      {type === 'TOKEN' && (
        completed ? (
          <span className="completed-icon">✓</span>
        ) : (
          <span className="arrow-icon">›</span>
        )
      )}
    </div>
  );
};

export default UniversalTaskCard;