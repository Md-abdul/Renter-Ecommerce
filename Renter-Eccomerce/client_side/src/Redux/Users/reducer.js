import {
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  SIGNUP_ERROR,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
} from "./actionType";


const initalState = {
    isAuth: localStorage.getItem("token") ? true : false, // Initialize auth state from localStorage
    isLoading: false,
    isError: false,
    token: localStorage.getItem("token") || null, // Initialize token from localStorage
  };
  
  export const reducer = (state = initalState, { type, payload }) => {
    switch (type) {
      case LOGIN_REQUEST:
      case SIGNUP_REQUEST: {
        return { ...state, isLoading: true, isError: false };
      }
      case LOGIN_SUCCESS:
      case SIGNUP_SUCCESS: {
        return { ...state, isLoading: false, isAuth: true, token: payload };
      }
      case LOGIN_ERROR:
      case SIGNUP_ERROR: {
        return { ...state, isLoading: false, isError: true };
      }
      case LOGOUT: {
        return { ...initalState, isAuth: false, token: null }; // Reset state to initial state
      }
      default: {
        return state;
      }
    }
  };