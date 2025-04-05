// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { Github, Facebook, Mail, Linkedin } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { register } from "../Redux/Users/action";
// import { toast } from "react-toastify";

// const SignupPage = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     const formData = { name: username, email, password };
//     const success = await dispatch(register(formData));
//     if (success) {
//       navigate("/"); // Redirect to dashboard or any other page after successful signup
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="relative w-full max-w-4xl h-[550px] bg-white rounded-[30px] shadow-lg overflow-hidden">
//         <motion.div
//           initial={{ x: "-100%" }}
//           animate={{ x: "0%" }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           className="absolute top-0 left-0 w-1/2 h-full bg-yellow-400"
//         >
//           <div className="h-full flex flex-col items-center justify-center text-center px-8">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.3 }}
//             >
//               <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
//               <p className="mb-6">Already have an account?</p>
//               <button
//                 onClick={() => navigate("/login")}
//                 className="px-8 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors cursor-pointer"
//               >
//                 Login
//               </button>
//             </motion.div>
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center p-12"
//         >
//           <form className="w-full max-w-md space-y-6" onSubmit={handleSignup}>
//             <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>

//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="relative">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="relative">
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full py-3 bg-yellow-400 rounded-lg font-semibold hover:bg-yellow-500 transition-colors cursor-pointer"
//             >
//               Sign Up
//             </button>

//             <div className="text-center">
//               <p className="text-gray-600 mb-4">or sign up with</p>
//               <div className="flex justify-center space-x-4">
//                 <SocialIcon icon={<Mail />} />
//                 <SocialIcon icon={<Facebook />} />
//                 <SocialIcon icon={<Github />} />
//                 <SocialIcon icon={<Linkedin />} />
//               </div>
//             </div>
//           </form>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// const SocialIcon = ({ icon }) => (
//   <a
//     href="#"
//     className="p-2 border-2 border-gray-300 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors"
//   >
//     {icon}
//   </a>
// );

// export default SignupPage;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Github, Facebook, Mail, Linkedin } from "lucide-react";
import { useDispatch } from "react-redux";
import { register } from "../Redux/Users/action";
import { toast } from "react-toastify";
import { FaGoogle } from "react-icons/fa";

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    const formData = { name: username, email, password };
    const success = await dispatch(register(formData));
    if (success) {
      navigate("/");
    }
  };

  const handleGoogleSignup = () => {
    const clientId =
      import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID ||
      process.env.REACT_APP_GOOGLE_CLIENT_ID ||
      "418833940575-9ok3fv8o722as25vurk95jlm6qujt0o5.apps.googleusercontent.com";

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=profile email`;
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative w-full max-w-4xl h-[550px] bg-white rounded-[30px] shadow-lg overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 w-1/2 h-full bg-yellow-400"
        >
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
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

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center p-12"
        >
          <form className="w-full max-w-md space-y-6" onSubmit={handleSignup}>
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 rounded-lg font-semibold hover:bg-yellow-500 transition-colors cursor-pointer"
            >
              Sign Up
            </button>

            <div className="text-center">
              <p className="text-gray-600 mb-4">or sign up with</p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="p-2 border-2 border-gray-300 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors"
                >
                  <FaGoogle />
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
