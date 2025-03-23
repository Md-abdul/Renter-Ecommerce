// // eslint-disable-next-line no-unused-vars
// import React from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { Github, Facebook, Mail, Linkedin } from 'lucide-react';

// const LoginPage = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="relative w-full max-w-4xl h-[550px] bg-white rounded-[30px] shadow-lg overflow-hidden">
//         <motion.div 
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-12"
//         >
//           <form className="w-full max-w-md space-y-6">
//             <h1 className="font-ubuntu text-3xl font-bold text-center mb-8">Login</h1>
            
//             <div className="relative">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="relative">
//               <input
//                 type="password"
//                 placeholder="Password"
//                 className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="text-right">
//               <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Forgot Password?</a>
//             </div>

//             <button className="w-full py-3 bg-yellow-400 rounded-lg font-semibold hover:bg-yellow-500 transition-colors cursor-pointer">
//               Login
//             </button>

//             <div className="text-center">
//               <p className="text-gray-600 mb-4">or login with</p>
//               <div className="flex justify-center space-x-4">
//                 <SocialIcon icon={<Mail />} />
//                 <SocialIcon icon={<Facebook />} />
//                 <SocialIcon icon={<Github />} />
//                 <SocialIcon icon={<Linkedin />} />
//               </div>
//             </div>
//           </form>
//         </motion.div>

//         <motion.div 
//           initial={{ x: "100%" }}
//           animate={{ x: "0%" }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           className="absolute top-0 right-0 w-1/2 h-full bg-yellow-400"
//         >
//           <div className="h-full flex flex-col items-center justify-center text-center px-8">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.3 }}
//             >
//               <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
//               <p className="mb-6">Don't have an account?</p>
//               <button
//                 onClick={() => navigate('/signup')}
//                 className="px-8 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors cursor-pointer"
//               >
//                 Sign Up
//               </button>
//             </motion.div>
//           </div>
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

// export default LoginPage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Github, Facebook, Mail, Linkedin } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { signIn } from '../Redux/Users/action';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const userData = { email, password };
    const success = await dispatch(signIn(userData));
    if (success) {
      navigate('/'); // Redirect to dashboard or any other page after successful login
    }
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
            <h1 className="font-ubuntu text-3xl font-bold text-center mb-8">Login</h1>
            
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Forgot Password?</a>
            </div>

            <button type="submit" className="w-full py-3 bg-yellow-400 rounded-lg font-semibold hover:bg-yellow-500 transition-colors cursor-pointer">
              Login
            </button>

            <div className="text-center">
              <p className="text-gray-600 mb-4">or login with</p>
              <div className="flex justify-center space-x-4">
                <SocialIcon icon={<Mail />} />
                <SocialIcon icon={<Facebook />} />
                <SocialIcon icon={<Github />} />
                <SocialIcon icon={<Linkedin />} />
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
                onClick={() => navigate('/signup')}
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