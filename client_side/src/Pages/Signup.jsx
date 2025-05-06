import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../Redux/Users/action";
import { toast } from "react-toastify";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react";

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = { name: username, email, password };
    const success = await dispatch(register(formData));
    setLoading(false);
    if (success) {
      navigate("/login");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      {/* Container for both sections */}
      <div className="w-full max-w-4xl bg-white rounded-[30px] shadow-lg overflow-hidden mt-10 sm:mt-5">
        {/* Flex container that changes direction based on screen size */}
        <div className="flex flex-col lg:flex-row">
          {/* Welcome Section - Comes first in DOM for mobile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 bg-yellow-400 p-8 lg:p-0 order-first lg:order-none"
          >
            <div className="h-full flex flex-col items-center justify-center text-center px-8 py-12 lg:py-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="mb-6">Already have an account?</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  Login
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Signup Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full lg:w-1/2 p-8 lg:p-12"
          >
            <form className="w-full space-y-6" onSubmit={handleSignup}>
              <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
                  required
                />
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                  loading
                    ? "bg-yellow-300 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Signing up...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>

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
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
