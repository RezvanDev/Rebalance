import { Dispatch } from "redux";
import axios from "axios";
import { BASE_URL } from "../../../constants/baseUrl";
import { UserActionTypes } from "../../../types/user";

export const fetchUser = (address: any) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      dispatch({ type: UserActionTypes.FETCH_USER });
      const response = await axios.get(`${BASE_URL}/api/auth/user-by-address/${address}`);
      dispatch({ type: UserActionTypes.FETCH_USER_SUCCESS, payload: response.data.user });
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error("Ошибка получения данных:", error);
      dispatch({ type: UserActionTypes.FETCH_USER_ERROR, payload: `Ошибка получения данных ${error}` });
    }
  };
};