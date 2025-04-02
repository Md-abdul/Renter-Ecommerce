import React, { useState } from "react";
import { FiHome, FiUsers, FiShoppingBag, FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_LOGOUT } from "../Redux/Users/actionType";
import { toast } from "react-toastify";
import { BsBox } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    dispatch({ type: ADMIN_LOGOUT });
    localStorage.removeItem("adminToken");
    toast.success("Admin logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-indigo-800 text-white transition-all duration-300`}
      >
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-full hover:bg-indigo-700"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        <nav className="mt-6">
          <div
            className={`flex items-center p-4 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-700"
                : "hover:bg-indigo-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FiHome className="text-xl" />
            {sidebarOpen && <span className="ml-3">Dashboard</span>}
          </div>
          <div
            className={`flex items-center p-4 cursor-pointer ${
              activeTab === "products" ? "bg-indigo-700" : "hover:bg-indigo-700"
            }`}
            onClick={() => setActiveTab("products")}
          >
            <FiShoppingBag className="text-xl" />
            {sidebarOpen && <span className="ml-3">Products</span>}
          </div>
          <div
            className={`flex items-center p-4 cursor-pointer ${
              activeTab === "users" ? "bg-indigo-700" : "hover:bg-indigo-700"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <FiUsers className="text-xl" />
            {sidebarOpen && <span className="ml-3">Users</span>}
          </div>
          <div
            className={`flex items-center p-4 cursor-pointer ${
              activeTab === "orders" ? "bg-indigo-700" : "hover:bg-indigo-700"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            <BsBox className="text-xl" />
            {sidebarOpen && <span className="ml-3">Orders</span>}
          </div>
          <div
            className="flex items-center p-4 cursor-pointer hover:bg-indigo-700 mt-10"
            onClick={() => setShowModal(true)}
          >
            <FiLogOut className="text-xl" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </div>
        </nav>
      </div>

      {/* Logout Confirmation Modal className="fixed inset-0 transition-opacity" */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-filter backdrop-blur-md"
          >
            <div className="bg-white rounded-lg shadow-xl sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to logout? You'll need to log back in to
                  access the admin panel.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none cursor-pointer"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;

// import React, { useState } from "react";
// import { FiHome, FiUsers, FiShoppingBag, FiLogOut } from "react-icons/fi";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { ADMIN_LOGOUT } from "../Redux/Users/actionType";
// import { toast } from "react-toastify";
// import { BsBox } from "react-icons/bs";
// import { motion, AnimatePresence } from "framer-motion";

// const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);

//   const handleLogout = () => {
//     dispatch({ type: ADMIN_LOGOUT });
//     localStorage.removeItem("adminToken");
//     toast.success("Admin logged out successfully");
//     navigate("/login");
//   };

//   return (
//     <>
//       <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-indigo-800 text-white transition-all duration-300`}>
//         <div className="p-4 flex items-center justify-between border-b border-indigo-700">
//           {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
//           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-full hover:bg-indigo-700">
//             {sidebarOpen ? "◀" : "▶"}
//           </button>
//         </div>
//         <nav className="mt-6">
//           <div
//             className={`flex items-center p-4 cursor-pointer ${activeTab === "dashboard" ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
//             onClick={() => setActiveTab("dashboard")}
//           >
//             <FiHome className="text-xl" />
//             {sidebarOpen && <span className="ml-3">Dashboard</span>}
//           </div>
//           <div
//             className={`flex items-center p-4 cursor-pointer ${activeTab === "products" ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
//             onClick={() => setActiveTab("products")}
//           >
//             <FiShoppingBag className="text-xl" />
//             {sidebarOpen && <span className="ml-3">Products</span>}
//           </div>
//           <div
//             className={`flex items-center p-4 cursor-pointer ${activeTab === "users" ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
//             onClick={() => setActiveTab("users")}
//           >
//             <FiUsers className="text-xl" />
//             {sidebarOpen && <span className="ml-3">Users</span>}
//           </div>
//           <div
//             className={`flex items-center p-4 cursor-pointer ${activeTab === "orders" ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
//             onClick={() => setActiveTab("orders")}
//           >
//             <BsBox className="text-xl" />
//             {sidebarOpen && <span className="ml-3">Orders</span>}
//           </div>
//           <div className="flex items-center p-4 cursor-pointer hover:bg-indigo-700 mt-10" onClick={() => setShowModal(true)}>
//             <FiLogOut className="text-xl" />
//             {sidebarOpen && <span className="ml-3">Logout</span>}
//           </div>
//         </nav>
//       </div>

//       {/* Logout Confirmation Modal */}
//       <AnimatePresence>
//         {showModal && (
//           <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg z-50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               transition={{ duration: 0.3, ease: "easeOut" }}
//               id="popup-modal"
//               tabIndex="-1"
//               className="fixed inset-0 flex justify-center items-center w-full h-full"
//             >
//               <div className="relative p-4 w-full max-w-md max-h-full">
//                 <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
//                   <button
//                     type="button"
//                     className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                     onClick={() => setShowModal(false)}
//                   >
//                     <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
//                       <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
//                     </svg>
//                     <span className="sr-only">Close modal</span>
//                   </button>
//                   <div className="p-4 md:p-5 text-center">
//                     <svg
//                       className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
//                       aria-hidden="true"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         stroke="currentColor"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
//                       />
//                     </svg>
//                     <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to logout?</h3>
//                     <button
//                       type="button"
//                       onClick={handleLogout}
//                       className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
//                     >
//                       Yes, I'm sure
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setShowModal(false)}
//                       className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
//                     >
//                       No, cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default AdminSidebar;
