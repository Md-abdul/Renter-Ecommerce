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

const API_URL = "https://renter-ecommerce.vercel.app/api/user";
const ADMIN_API_URL = "https://renter-ecommerce.vercel.app/api/admin/login";

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
    // toast.error(error.response?.data?.message || "Login failed");
    return false; // Return false indicating login failure
  }
};

export const register = (formData) => async (dispatch) => {
  dispatch({ type: SIGNUP_REQUEST });
  try {
    const response = await axios.post(`${API_URL}/signup`, formData);
    // Don't store any token, just dispatch success
    dispatch({ type: SIGNUP_SUCCESS });
    toast.success("Signup successful. Please login.");
    return true; // Return true indicating successful signup
  } catch (error) {
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

export const adminLogin = (adminData) => async (dispatch) => {
  dispatch({ type: "ADMIN_LOGIN_REQUEST" });
  try {
    // Send a POST request to the server for admin login
    const response = await axios.post(`${ADMIN_API_URL}`, adminData);
    const token = response.data.token; // Assuming the server returns a token
    const admin = response.data.admin; // Assuming the server returns admin details

    dispatch({ type: "ADMIN_LOGIN_SUCCESS", payload: token });
    localStorage.setItem("adminToken", token);
    localStorage.setItem("admin", JSON.stringify(admin)); // Store admin details in localStorage
    toast.success("Admin login successful");
    return true; // Return true indicating successful admin login
  } catch (error) {
    dispatch({ type: "ADMIN_LOGIN_ERROR" });
    toast.error(error.response?.data?.message || "Admin login failed");
    return false; // Return false indicating admin login failure
  }
};

// In action.js
// Add this new action
export const googleLoginSuccess = (token, user) => (dispatch) => {
  dispatch({ type: LOGIN_SUCCESS, payload: token });
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  toast.success("Google login successful");
};
