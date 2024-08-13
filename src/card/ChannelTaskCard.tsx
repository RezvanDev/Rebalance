import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ChannelTaskCardProps {
  id: number;
  name: string;
  reward: string;
  completed: boolean;
  link: string;
  channelLink: string;
  onSubscribe: (id: number) => void;
}

const ChannelTaskCard: React.FC<ChannelTaskCardProps> = ({
  id, name, reward, completed, link, channelLink, onSubscribe
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!completed) {
      window.open(channelLink, '_blank');
      onSubscribe(id);
    } else {
      navigate(link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`channel-item ${completed ? 'completed' : ''}`}
    >
      <img src="/path-to-channel-icon.png" alt="Channel icon" className="channel-icon" />
      <div className="channel-info">
        <span className="channel-name">{name}</span>
        <span className="channel-reward">{reward}</span>
      </div>
      {completed ? (
        <span className="completed-icon">✓</span>
      ) : (
        <span className="arrow-icon">›</span>
      )}
    </div>
  );
};

export default ChannelTaskCard;