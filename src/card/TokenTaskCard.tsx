import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TokenTaskCardProps {
  id: number;
  title: string;
  reward: string;
  tokenAmount: number;
  completed: boolean;
}

const TokenTaskCard: React.FC<TokenTaskCardProps> = ({
  id, title, reward, tokenAmount, completed
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/token-task/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`token-item ${completed ? 'completed' : ''}`}
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
        <span className="arrow-icon">›</span>
      )}
    </div>
  );
};

export default TokenTaskCard;