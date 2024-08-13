import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TokenTaskCardProps {
  id: number;
  name: string;
  reward: string;
  link: string;
  completed: boolean;
}

const TokenTaskCard: React.FC<TokenTaskCardProps> = ({ id, name, reward, link, completed }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      className={`token-item ${completed ? 'completed' : ''}`}
    >
      <div className="token-icon">₭</div>
      <div className="token-info">
        <span className="token-name">{name}</span>
        <span className="token-reward">{reward}</span>
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