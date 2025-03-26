import React from "react";
import { FiHome, FiUsers, FiShoppingBag, FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_LOGOUT } from "../Redux/Users/actionType";
import { toast } from "react-toastify";

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: ADMIN_LOGOUT });
    localStorage.removeItem("adminToken");
    toast.success("Admin logged out successfully");
    navigate("/login");
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-800 text-white transition-all duration-300`}>
      <div className="p-4 flex items-center justify-between border-b border-indigo-700">
        {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-full hover:bg-indigo-700"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>
      <nav className="mt-6">
        <div 
          className={`flex items-center p-4 cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiHome className="text-xl" />
          {sidebarOpen && <span className="ml-3">Dashboard</span>}
        </div>
        <div 
          className={`flex items-center p-4 cursor-pointer ${activeTab === 'products' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          onClick={() => setActiveTab('products')}
        >
          <FiShoppingBag className="text-xl" />
          {sidebarOpen && <span className="ml-3">Products</span>}
        </div>
        <div 
          className={`flex items-center p-4 cursor-pointer ${activeTab === 'users' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers className="text-xl" />
          {sidebarOpen && <span className="ml-3">Users</span>}
        </div>
        <div 
          className="flex items-center p-4 cursor-pointer hover:bg-indigo-700 mt-10"
          onClick={handleLogout}
        >
          <FiLogOut className="text-xl" />
          {sidebarOpen && <span className="ml-3">Logout</span>}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;