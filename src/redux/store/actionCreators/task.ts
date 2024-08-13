import { Dispatch } from 'redux';
import { fetchTasks } from '../../../api/taskApi';
import { TaskActionTypes } from '../../../types/task';

export const fetchTask = (type: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: TaskActionTypes.FETCH_TASK });
      const tasks = await fetchTasks(type);
      dispatch({ type: TaskActionTypes.FETCH_TASK_SUCCESS, payload: tasks });
    } catch (error) {
      dispatch({ type: TaskActionTypes.FETCH_TASK_ERROR, payload: error.message });
    }
  };
};