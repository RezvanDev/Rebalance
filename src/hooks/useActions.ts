import { useDispatch } from "react-redux"
import { bindActionCreators } from "redux"
import * as UserActionCreators from "../redux/store/actions/user"
import * as TaskActionCreators from "../redux/store/actions/taskActions"


export const useActions = ():any => {
  const dispatch = useDispatch ()
  return bindActionCreators (Object.assign({}, UserActionCreators, TaskActionCreators), dispatch)
}