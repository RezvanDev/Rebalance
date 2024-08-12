import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ChannelTaskCardProps {
  id: number;
  title: string;
  reward: string;
  completed: boolean;
  channelUsername: string;
  onSubscribe: (id: number) => void;
}

const ChannelTaskCard: React.FC<ChannelTaskCardProps> = ({
  id, title, reward, completed, channelUsername, onSubscribe
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!completed) {
      window.open(`https://t.me/${channelUsername}`, '_blank');
      onSubscribe(id);
    } else {
      navigate(`/channel/${channelUsername}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`channel-item ${completed ? 'completed' : ''}`}
    >
      <img src="/path-to-channel-icon.png" alt="Channel icon" className="channel-icon" />
      <div className="channel-info">
        <span className="channel-name">{title}</span>
        <span className="channel-reward">{reward} REBA</span>
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