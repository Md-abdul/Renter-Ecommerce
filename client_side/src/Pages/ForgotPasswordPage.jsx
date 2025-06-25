// src/Pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/user/forgot-password`, { email });
      toast.success(res.data.message);
      setOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/user/reset-password`, {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
            />
            <button
              onClick={sendOtp}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg cursor-pointer"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              required
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              required
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
            />
            <button
              onClick={resetPassword}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg cursor-pointer"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
