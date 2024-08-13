import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TokenTaskCardProps {
  id: number;
  name: string;
  reward: string;
  link: string;
  completed: boolean;
  onAction: (id: number) => void;
}

const TokenTaskCard: React.FC<TokenTaskCardProps> = ({ id, name, reward, link, completed, onAction }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!completed) {
      onAction(id);
    } else {
      navigate(link);
    }
  };

  return (
    <div
      onClick={handleClick}
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