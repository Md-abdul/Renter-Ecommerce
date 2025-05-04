import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signIn } from "../Redux/Users/action";
import { toast } from "react-toastify";

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (token && userId) {
      // Store token in localStorage
      localStorage.setItem("token", token);

      // Dispatch login success action
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: token,
      });

      // Fetch user details and store them
      const user = { userId, token };
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful");
      navigate("/"); // Redirect to home page
    } else {
      toast.error("Google login failed");
      navigate("/login");
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing your login...</h1>
        <p>Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
