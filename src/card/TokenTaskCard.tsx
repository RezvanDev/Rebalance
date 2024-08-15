import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TokenTaskCardProps {
  id: number;
  title: string;
  reward: string;
  tokenAmount: number;
  completed: boolean;
  onComplete: (id: number) => void;
}

const TokenTaskCard: React.FC<TokenTaskCardProps> = ({ id, title, reward, tokenAmount, completed, onComplete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!completed) {
      navigate(`/token-task/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`token-task-card ${completed ? 'completed' : ''}`}
    >
      <div className="token-icon">₭</div>
      <div className="token-info">
        <span className="token-name">{title}</span>
        <span className="token-reward">{reward}</span>
        <span className="token-amount">Требуется: {tokenAmount} токенов</span>
      </div>
      {completed ? (
        <span className="completed-icon">✓</span>
      ) : (
        <button onClick={(e) => {
          e.stopPropagation();
          onComplete(id);
        }} className="complete-button">
          Выполнить
        </button>
      )}
    </div>
  );
};

export default TokenTaskCard;