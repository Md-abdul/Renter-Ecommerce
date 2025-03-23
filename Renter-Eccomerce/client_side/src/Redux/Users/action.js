import axios from "axios";
import { toast } from "react-toastify";
import {
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  SIGNUP_ERROR,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
} from "./actionType";

const API_URL = "http://localhost:5000/api/user";

export const signIn = (userData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    const token = response.data.token;
    const user = response.data.user; // Assuming the API returns user details
    dispatch({ type: LOGIN_SUCCESS, payload: token });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // Store user details in localStorage
    toast.success("Login successful");
    return true; // Return true indicating successful login
  } catch (error) {
    console.error("Sign In Error:", error);
    dispatch({ type: LOGIN_ERROR });
    toast.error(error.response?.data?.message || "Login failed");
    return false; // Return false indicating login failure
  }
};

export const register = (formData) => async (dispatch) => {
  dispatch({ type: SIGNUP_REQUEST });
  try {
    const response = await axios.post(`${API_URL}/signup`, formData);
    const token = response.data.token;
    dispatch({ type: SIGNUP_SUCCESS, payload: token });
    localStorage.setItem("token", token);
    toast.success("Signup successful");
    return true; // Return true indicating successful signup
  } catch (error) {
    console.error("Signup Error:", error);
    dispatch({ type: SIGNUP_ERROR });
    toast.error(error.response?.data?.message || "Signup failed");
    return false; // Return false indicating signup failure
  }
};

export const LogoutUsers = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // Remove user details from localStorage
  dispatch({ type: LOGOUT });
};
