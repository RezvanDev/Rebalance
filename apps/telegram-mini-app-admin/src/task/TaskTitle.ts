import { Task as TTask } from "../api/task/Task";

export const TASK_TITLE_FIELD = "taskType";

export const TaskTitle = (record: TTask): string => {
  return record.taskType?.toString() || String(record.id);
};
