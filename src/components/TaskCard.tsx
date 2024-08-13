import React from 'react';
import { Task } from '../types/task';
import '../styles/TaskCard.css';

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