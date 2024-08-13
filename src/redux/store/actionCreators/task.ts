import { Dispatch } from "redux";
import axios from "axios";
import { BASE_URL } from "../../../constants/baseUrl";
import { TaskActionTypes } from "../../../types/task";

export const fetchTask = (type: string) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      dispatch({ type: TaskActionTypes.FETCH_TASK });
      console.log(`Fetching tasks of type: ${type}`);
      const response = await axios.get(`${BASE_URL}/api/tasks/`, {
        params: { type }
      });
      console.log('Received tasks:', response.data);
      dispatch({ type: TaskActionTypes.FETCH_TASK_SUCCESS, payload: response.data.tasks });
    } catch (error) {
      console.error("Ошибка получения данных:", error);
      dispatch({ type: TaskActionTypes.FETCH_TASK_ERROR, payload: `Ошибка получения данных ${error}` });
    }
  };
};