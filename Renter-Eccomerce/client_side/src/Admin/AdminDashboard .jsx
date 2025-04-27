// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { ADMIN_LOGOUT } from "../Redux/Users/actionType";
// import { toast } from "react-toastify";

// const AdminDashboard = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isAdmin = useSelector((state) => state);

//   console.log(isAdmin);

// const handleLogout = () => {
//   dispatch({ type: ADMIN_LOGOUT });
//   localStorage.removeItem("adminToken");
//   toast.success("Admin logged out successfully");
//   navigate("/login");
// };

//   if (!isAdmin) {
//     return <div className="mt-40">Unauthorized Access</div>;
//   }

//   return (
//     <div style={{ marginTop: "20rem" }}>
//       <h1>Welcome to Admin Dashboard</h1>
//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import DashboardContent from "./Dashboard";
import ProductsContent from "./Products";
import UsersContent from "./Users";
import { Orders } from "./Orders/Orders";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 -mt-12">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 overflow-auto">
        <AdminHeader
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="p-6">
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "products" && <ProductsContent />}
          {activeTab === "users" && <UsersContent />}
          {activeTab === "orders" && <Orders />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
