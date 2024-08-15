import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TokenTaskCardProps {
  id: number;
  name: string;
  reward: string;
  completed: boolean;
  link: string;
  channelUsername: string;
  tokenAddress: string;
  requiredTokenAmount: number;
  onComplete: (id: number) => void;
}

const TokenTaskCard: React.FC<TokenTaskCardProps> = ({
  id, name, reward, completed, link, channelUsername, tokenAddress, requiredTokenAmount, onComplete
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!completed) {
      window.open(`https://t.me/${channelUsername}`, '_blank');
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completed) {
      onComplete(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`token-item ${completed ? 'completed' : ''}`}
    >
      <img src="/path-to-token-icon.png" alt="Token icon" className="token-icon" />
      <div className="token-info">
        <span className="token-name">{name}</span>
        <span className="token-reward">{reward}</span>
        <span className="token-requirement">Требуется: {requiredTokenAmount} токенов</span>
      </div>
      {completed ? (
        <span className="completed-icon">✓</span>
      ) : (
        <button onClick={handleComplete} className="complete-button">
          Подтвердить
        </button>
      )}
    </div>
  );
};

export default TokenTaskCard;