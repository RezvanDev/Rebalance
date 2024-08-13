import { TaskActionTypes, TaskState } from '../../../types/task';

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null
};

export const tasksReducer = (state = initialState, action: any): TaskState => {
  switch (action.type) {
    case TaskActionTypes.FETCH_TASKS:
      return { ...state, loading: true, error: null };
    case TaskActionTypes.FETCH_TASKS_SUCCESS:
      return { ...state, loading: false, tasks: action.payload };
    case TaskActionTypes.FETCH_TASKS_ERROR:
      return { ...state, loading: false, error: action.payload };
    case TaskActionTypes.COMPLETE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, completed: true } : task
        )
      };
    default:
      return state;
  }
};