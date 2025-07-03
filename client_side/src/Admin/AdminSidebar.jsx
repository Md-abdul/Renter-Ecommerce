import React, { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_LOGOUT } from "../Redux/Users/actionType";
import { toast } from "react-toastify";
import { BsBox } from "react-icons/bs";
import { GoDatabase } from "react-icons/go";
import { motion, AnimatePresence } from "framer-motion";
import { VscGift } from "react-icons/vsc";
import { IoStorefrontOutline } from "react-icons/io5";

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    dispatch({ type: ADMIN_LOGOUT });
    localStorage.removeItem("adminToken");
    toast.success("Admin logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", icon: <FiHome />, label: "Dashboard" },
    { id: "products", icon: <FiShoppingBag />, label: "Products" },
    { id: "users", icon: <FiUsers />, label: "Users" },
    { id: "orders", icon: <BsBox />, label: "Orders" },
    { id: "billingrecords", icon: <GoDatabase />, label: "Billing Records" },
    { id: "coupon", icon: <VscGift />, label: "Coupons" },
    {
      id: "storelocator_admin",
      icon: <IoStorefrontOutline />,
      label: "Store Management",
    },
  ];

  return (
    <>
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-yellow-400 text-black h-screen flex flex-col transition-all duration-300 ease-in-out shadow-lg`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-black/10">
          {sidebarOpen && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-black"
            >
              Admin Panel
            </motion.h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-black/10 transition-colors duration-200 cursor-pointer"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <FiChevronLeft className="text-xl" />
            ) : (
              <FiChevronRight className="text-xl" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col mt-2">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center p-4 cursor-pointer ${
                activeTab === item.id
                  ? "bg-black text-white"
                  : "hover:bg-black/10"
              } transition-colors duration-200 mx-2 rounded-lg`}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="text-xl">{item.icon}</div>
              {sidebarOpen ? (
                <span className="ml-3">{item.label}</span>
              ) : (
                <AnimatePresence>
                  {hoveredItem === item.id && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-full ml-4 px-3 py-1 bg-black text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          ))}

          {/* Logout Button */}
          <div className="mt-auto mb-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center p-4 cursor-pointer hover:bg-red-500 hover:text-white mx-2 rounded-lg transition-colors duration-200"
              onClick={() => setShowModal(true)}
              onMouseEnter={() => setHoveredItem("logout")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <FiLogOut className="text-xl" />
              {sidebarOpen ? (
                <span className="ml-3">Logout</span>
              ) : (
                <AnimatePresence>
                  {hoveredItem === "logout" && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-full ml-4 px-3 py-1 bg-black text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </div>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md mx-4"
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to logout? You'll need to log back in to
                  access the admin panel.
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-200"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none transition-colors duration-200"
                    onClick={handleLogout}
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
