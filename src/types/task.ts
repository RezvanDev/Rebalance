export enum TaskActionTypes {
  FETCH_TASK = "FETCH_TASK",
  FETCH_TASK_SUCCESS = "FETCH_TASK_SUCCESS",
  FETCH_TASK_ERROR = "FETCH_TASK_ERROR",
}

interface FetchTaskAction {
  type: TaskActionTypes.FETCH_TASK;
}

interface FetchTaskSuccessAction {
  type: TaskActionTypes.FETCH_TASK_SUCCESS;
  payload: any[];
}

interface FetchTaskErrorAction {
  type: TaskActionTypes.FETCH_TASK_ERROR;
  payload: string;
}

export type StockAction =
  | FetchTaskAction
  | FetchTaskSuccessAction
  | FetchTaskErrorAction;