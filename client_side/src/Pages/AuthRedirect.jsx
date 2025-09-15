// import React, { useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { signIn } from "../Redux/Users/action";
// import { toast } from "react-toastify";
// import { useCart } from "../context/CartContext";

// const AuthRedirect = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { checkAndHandlePostLoginRedirect } = useCart();

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const token = params.get("token");
//     const userId = params.get("userId");

//     if (token && userId) {
//       // Store token in localStorage
//       localStorage.setItem("token", token);

//       // Dispatch login success action
//       dispatch({
//         type: "LOGIN_SUCCESS",
//         payload: token,
//       });

//       // Fetch user details and store them
//       const user = { userId, token };
//       localStorage.setItem("user", JSON.stringify(user));

//       toast.success("Login successful");

//       // Check if there's an intended destination to redirect to
//       setTimeout(() => {
//         checkAndHandlePostLoginRedirect();
//       }, 100); // Small delay to ensure token is stored
//     } else {
//       toast.error("Google login failed");
//       navigate("/login");
//     }
//   }, [location, navigate, dispatch, checkAndHandlePostLoginRedirect]);

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="text-center">
//         <h1 className="text-2xl font-bold mb-4">Processing your login...</h1>
//         <p>Please wait while we authenticate your account.</p>
//       </div>
//     </div>
//   );
// };

// export default AuthRedirect;



import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleGoogleAuth } from "../Redux/Users/action";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { checkAndHandlePostLoginRedirect } = useCart();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      if (processed) return;

      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const userId = params.get("userId");

      if (token && userId) {
        try {
          // Use the new handleGoogleAuth action instead of manual handling
          const success = await dispatch(handleGoogleAuth(token, { userId, token }));
          
          if (success) {
            toast.success("Login successful");
            setProcessed(true);

            // Check if there's an intended destination to redirect to
            setTimeout(() => {
              checkAndHandlePostLoginRedirect();
            }, 200);
          } else {
            throw new Error("Google authentication failed");
          }
          
        } catch (error) {
          console.error("Auth processing error:", error);
          toast.error("Authentication failed");
          navigate("/login", { replace: true });
        }
      } else {
        toast.error("Google login failed - missing token or user ID");
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [location, navigate, dispatch, checkAndHandlePostLoginRedirect, processed]);

  // Fallback redirect in case something goes wrong
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token && !processed) {
        navigate('/user-profile', { replace: true });
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [navigate, processed]);

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