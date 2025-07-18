import { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export const PrivateRoutes = ({ children }) => {
  const auth = useSelector((store) => store.UsersReducer.isAuth);
  const location = useLocation();

  useEffect(() => {
    if (!auth) {
      // Store the intended destination for redirect after login
      localStorage.setItem("intendedDestination", location.pathname);
      // Optionally, you can add some logging or other side-effects here if needed.
      // console.log("User is not authenticated, redirecting to login.");
    }
  }, [auth, location]);

  return auth ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

PrivateRoutes.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoutes;
