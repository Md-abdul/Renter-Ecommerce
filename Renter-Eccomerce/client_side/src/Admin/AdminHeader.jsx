import React from "react";
import { FiSearch, FiMenu, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AdminHeader = ({ activeTab, sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-yellow-50 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {/* {sidebarOpen ? (
              <FiChevronLeft className="w-5 h-5" />
            ) : (
              <FiChevronRight className="w-5 h-5" />
            )} */}
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Product Management'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'orders' && 'Order Management'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'dashboard' && 'View your store analytics and metrics'}
              {activeTab === 'products' && 'Manage your product inventory and listings'}
              {activeTab === 'users' && 'View and manage customer accounts'}
              {activeTab === 'orders' && 'Track and process customer orders'}
            </p>
          </div>
        </div>
        
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;