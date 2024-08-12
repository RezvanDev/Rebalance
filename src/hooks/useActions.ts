import { useDispatch } from "react-redux"
import { bindActionCreators } from "redux"
import * as UserActionCreators from "../redux/store/actionCreators/user"
import * as TaskActionCreators from "../redux/store/actionCreators/task"


export const useActions = ():any => {
  const dispatch = useDispatch ()
  return bindActionCreators (Object.assign({}, UserActionCreators, TaskActionCreators), dispatch)
}