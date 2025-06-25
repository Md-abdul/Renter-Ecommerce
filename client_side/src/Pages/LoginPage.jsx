// export default LoginPage;
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate,Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { adminLogin, signIn } from "../Redux/Users/action";
import { toast } from "react-toastify";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userData = { email, password };

    const userSuccess = await dispatch(signIn(userData));
    if (userSuccess) {
      setLoading(false);
      navigate("/");
      return;
    }

    const adminSuccess = await dispatch(adminLogin(userData));
    setLoading(false);
    if (adminSuccess) {
      navigate("/adminDashboard");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 ">
      {/* Container for both form and signup section */}
      <div className="w-full max-w-4xl bg-white rounded-[30px] shadow-lg overflow-hidden mt-10 sm:mt-5">
        {/* Flex container that changes direction based on screen size */}
        <div className="flex flex-col lg:flex-row">
          {/* Login Form Section - Always comes first in DOM for mobile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 p-8 lg:p-12"
          >
            <form className="w-full space-y-6" onSubmit={handleLogin}>
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

              <div className="text-right">
                <Link to={"/forgot_password"}>
                  <p
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Forgot Password?
                  </p>
                </Link>
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
                    Logging in...
                  </div>
                ) : (
                  "Login"
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

          {/* Signup Section - Comes second in DOM for mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full lg:w-1/2 bg-yellow-400 p-8 lg:p-0"
          >
            <div className="h-full flex flex-col items-center justify-center text-center px-8 py-12 lg:py-0">
              <div>
                <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
                <p className="mb-6">Don't have an account?</p>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
