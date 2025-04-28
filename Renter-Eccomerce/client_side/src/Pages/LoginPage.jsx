import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Github, Facebook, Mail, Linkedin } from "lucide-react";
import { useDispatch } from "react-redux";
import { adminLogin, signIn } from "../Redux/Users/action";
import { toast } from "react-toastify";
import { FaGoogle } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Install react-icons if you haven't

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    const userData = { email, password };

    // Try User Login first
    const userSuccess = await dispatch(signIn(userData));
    if (userSuccess) {
      navigate("/"); // Redirect user to user dashboard
      return;
    }

    // If user login fails, try Admin Login
    const adminSuccess = await dispatch(adminLogin(userData));
    if (adminSuccess) {
      navigate("/adminDashboard"); // Redirect to admin dashboard
    }
  };

  const handleGoogleSignup = () => {
    // Use the backend URL from environment variables
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative w-full max-w-4xl h-[550px] bg-white rounded-[30px] shadow-lg overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-12"
        >
          <form className="w-full max-w-md space-y-6" onSubmit={handleLogin}>
            <h1 className="font-ubuntu text-3xl font-bold text-center mb-8">
              Login
            </h1>

            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12" // add pr-12 to leave space for the icon
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </div>
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 rounded-lg font-semibold hover:bg-yellow-500 transition-colors cursor-pointer"
            >
              Login
            </button>

            {/* <div className="text-center">
              <p className="text-gray-600 mb-4">or login with</p>
              <div className="flex justify-center space-x-4">
                <SocialIcon icon={<Mail />} />
                <SocialIcon icon={<Facebook />} />
                <SocialIcon icon={<Github />} />
                <SocialIcon icon={<Linkedin />} />
              </div>
            </div> */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Or sign up with Google</p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="p-2 border-2 border-gray-300 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  <FaGoogle />
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 right-0 w-1/2 h-full bg-yellow-400"
        >
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <p className="mb-6">Don't have an account?</p>
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SocialIcon = ({ icon }) => (
  <a
    href="#"
    className="p-2 border-2 border-gray-300 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors"
  >
    {icon}
  </a>
);

export default LoginPage;
