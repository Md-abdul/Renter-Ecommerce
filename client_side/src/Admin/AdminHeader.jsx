import React from "react";
import {
  FiSearch,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const AdminHeader = ({ activeTab, sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-yellow-50 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          ></button>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "products" && "Product Management"}
              {activeTab === "users" && "User Management"}
              {activeTab === "orders" && "Order Management"}
              {activeTab === "paymenttransactions" && "Payment Management"}
              {activeTab === "billingrecords" && "Sold Prodct Billing Records"}
              {activeTab === "coupon" && "Create Coupons"}
              {activeTab === "storelocator_admin" && "Store Locator"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === "dashboard" &&
                "View your store analytics and metrics"}
              {activeTab === "products" &&
                "Manage your product inventory and listings"}
              {activeTab === "users" && "View and manage customer accounts"}
              {activeTab === "orders" && "Track and process customer orders"}
              {activeTab === "paymenttransactions" &&
                "Monitor all PhonePe payment transactions and their status"}
              {activeTab === "coupon" && "Make Coupons "}
              {activeTab === "storelocator_admin" &&
                "Add and manage your retail locations"}
              {/* {activeTab === "pageaccess" && "Add and manage your retail locations"} */}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
