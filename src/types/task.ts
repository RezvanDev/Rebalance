export enum TaskType {
  CHANNEL = 'CHANNEL',
  TOKEN = 'TOKEN'
}

export interface Task {
  id: number;
  type: TaskType;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  channelUsername?: string;
  tokenAddress?: string;
  tokenAmount?: number;
}

export enum TaskActionTypes {
  FETCH_TASKS = 'FETCH_TASKS',
  FETCH_TASKS_SUCCESS = 'FETCH_TASKS_SUCCESS',
  FETCH_TASKS_ERROR = 'FETCH_TASKS_ERROR',
  COMPLETE_TASK = 'COMPLETE_TASK',
  COMPLETE_TASK_SUCCESS = 'COMPLETE_TASK_SUCCESS',
  COMPLETE_TASK_ERROR = 'COMPLETE_TASK_ERROR'
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}