import { TaskActionTypes } from "../../../types/task";

const initialState: any = {
  tasks: [],
  loading: false,
  error: null,
};

export const tasksReducer = (state = initialState, action: any): any => {
  switch (action.type) {
    case TaskActionTypes.FETCH_TASK:
      return { ...state, loading: true, error: null };
    case TaskActionTypes.FETCH_TASK_SUCCESS:
      return { loading: false, error: null, tasks: action.payload };
    case TaskActionTypes.FETCH_TASK_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};