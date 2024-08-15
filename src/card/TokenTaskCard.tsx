import React from 'react';
import '../styles/TaskCard.css';

interface TokenTaskCardProps {
  id: number;
  title: string;
  reward: string;
  tokenAmount: number;
  completed: boolean;
  onClick: (taskId: number) => void;
}

const TokenTaskCard: React.FC<TokenTaskCardProps> = ({ 
  id, 
  title, 
  reward, 
  tokenAmount, 
  completed, 
  onClick 
}) => {
  return (
    <div
      className={`task-card ${completed ? 'completed' : ''}`}
      onClick={() => onClick(id)}
    >
      <div className="task-icon">
        ₭
      </div>
      <div className="task-info">
        <span className="task-name">{title}</span>
        <span className="task-reward">{reward}</span>
        <span className="token-amount">Требуется: {tokenAmount} токенов</span>
      </div>
      {completed ? (
        <span className="completed-icon">✓</span>
      ) : (
        <span className="arrow-icon">›</span>
      )}
    </div>
  );
};

export default TokenTaskCard;