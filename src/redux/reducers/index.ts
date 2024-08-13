import { combineReducers } from "redux";
import { userReducer } from "./userReducer";
import { tasksReducer } from "./taskReducer";

export const rootReducer: any = combineReducers({
  user: userReducer,
  tasks: tasksReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
