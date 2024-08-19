import React from 'react';

interface TokenTaskCardProps {
  id: number;
  name: string;
  reward: string;
  completed: boolean;
  onClick: () => void;
}

const TokenTaskCard: React.FC<TokenTaskCardProps> = ({ id, name, reward, completed, onClick }) => {
  return (
    <div
      onClick={onClick}
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