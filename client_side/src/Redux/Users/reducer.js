import {
  ADMIN_LOGIN_ERROR,
  ADMIN_LOGIN_REQUEST,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGOUT,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  SIGNUP_ERROR,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
} from "./actionType";

const initialState = {
  isAuth: localStorage.getItem("token") ? true : false,
  isLoading: false,
  isError: false,
  token: localStorage.getItem("token") || null,
  isAdmin: localStorage.getItem("adminToken") ? true : false, // Admin state
};

export const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case LOGIN_REQUEST:
    case SIGNUP_REQUEST:
    case ADMIN_LOGIN_REQUEST: {
      return { ...state, isLoading: true, isError: false };
    }
    case LOGIN_SUCCESS: {
      return { ...state, isLoading: false, isAuth: true, token: payload };
    }
    case SIGNUP_SUCCESS: {
      return { ...state, isLoading: false, isError: false };
    }
    case ADMIN_LOGIN_SUCCESS: {
      return { ...state, isLoading: false, isAdmin: true };
    }
    case LOGIN_ERROR:
    case SIGNUP_ERROR:
    case ADMIN_LOGIN_ERROR: {
      return { ...state, isLoading: false, isError: true };
    }
    case LOGOUT: {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { ...initialState, isAuth: false, token: null };
    }
    case ADMIN_LOGOUT: {
      localStorage.removeItem("adminToken");
      return { ...initialState, isAdmin: false };
    }
    default: {
      return state;
    }
  }
};
