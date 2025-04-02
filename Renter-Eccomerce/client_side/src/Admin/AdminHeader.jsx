import React from "react";
import { FiSearch } from "react-icons/fi";

const AdminHeader = ({ activeTab, sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-200 mr-4"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'products' && 'Product Management'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'orders' && 'Orders'}
          </h2>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;