import { TaskActionTypes } from "../../../types/task";

const initialState: any = {
  tasks: [],
  loading: false,
  error: null,
};

export const tasksReducer = (
  state = initialState,
  action: any
): any => {
  switch (action.type) {
    case TaskActionTypes.FETCH_TASK:
      return { loading: true, error: null, tasks: [] };
    case TaskActionTypes.FETCH_TASK_SUCCESS:
      return { loading: false, error: null, tasks: action.payload };
    case TaskActionTypes.FETCH_TASK_ERROR:
      return { loading: false, error: action.payload, tasks: [] };
    default:
      return state;
  }
};
