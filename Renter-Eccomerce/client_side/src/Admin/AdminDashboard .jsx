import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_LOGOUT } from "../Redux/Users/actionType";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = useSelector((state) => state);

  console.log(isAdmin);

  const handleLogout = () => {
    dispatch({ type: ADMIN_LOGOUT });
    localStorage.removeItem("adminToken");
    toast.success("Admin logged out successfully");
    navigate("/login");
  };

  if (!isAdmin) {
    return <div className="mt-40">Unauthorized Access</div>;
  }

  return (
    <div style={{ marginTop: "20rem" }}>
      <h1>Welcome to Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
