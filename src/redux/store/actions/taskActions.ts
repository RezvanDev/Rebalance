import { Dispatch } from 'redux';
import { TaskActionTypes, TaskType } from '../../../types/task';
import { fetchTasks, completeTask } from '../../../api/taskApi';

export const fetchTasksAction = (type: TaskType) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: TaskActionTypes.FETCH_TASKS });
      const tasks = await fetchTasks(type);
      dispatch({ type: TaskActionTypes.FETCH_TASKS_SUCCESS, payload: tasks });
    } catch (error) {
      dispatch({ type: TaskActionTypes.FETCH_TASKS_ERROR, payload: error.message || 'Произошла ошибка при загрузке заданий' });
    }
  };
};

export const completeTaskAction = (taskId: number) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: TaskActionTypes.COMPLETE_TASK });
      const completedTask = await completeTask(taskId);
      dispatch({ type: TaskActionTypes.COMPLETE_TASK_SUCCESS, payload: completedTask });
    } catch (error) {
      dispatch({ type: TaskActionTypes.COMPLETE_TASK_ERROR, payload: error.message || 'Произошла ошибка при выполнении задания' });
    }
  };
};