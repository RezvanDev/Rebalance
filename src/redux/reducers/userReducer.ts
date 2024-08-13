import { UserActionTypes } from "../../../types/user";

const initialState: any = {
  userData: [],
  loading: false,
  error: null,
};

export const userReducer = (
  state = initialState,
  action: any
): any => {
  switch (action.type) {
    case UserActionTypes.FETCH_USER:
      return { loading: true, error: null, userData: [] };
    case UserActionTypes.FETCH_USER_SUCCESS:
      return { loading: false, error: null, userData: action.payload };
    case UserActionTypes.FETCH_USER_ERROR:
      return { loading: false, error: action.payload, userData: [] };
    default:
      return state;
  }
};
