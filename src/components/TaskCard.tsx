import React from 'react';
import '../styles/TaskCard.css';

interface Task {
  id: number;
  title: string;
  reward: string;
  tokenAmount?: number;
  completed: boolean;
  type: 'CHANNEL' | 'TOKEN';
}

interface TaskCardProps {
  task: Task;
  onClick: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <div
      className={`task-card ${task.completed ? 'completed' : ''}`}
      onClick={() => onClick(task.id)}
    >
      <div className="task-icon">
        {task.type === 'CHANNEL' ? '📢' : '₭'}
      </div>
      <div className="task-info">
        <span className="task-name">{task.title}</span>
        <span className="task-reward">{task.reward}</span>
        {task.type === 'TOKEN' && task.tokenAmount && (
          <span className="token-amount">Требуется: {task.tokenAmount} токенов</span>
        )}
      </div>
      {task.completed ? (
        <span className="completed-icon">✓</span>
      ) : (
        <span className="arrow-icon">›</span>
      )}
    </div>
  );
};

export default TaskCard;