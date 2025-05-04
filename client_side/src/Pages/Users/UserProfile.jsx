import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { RiLockPasswordLine, RiHistoryLine } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { useDispatch } from "react-redux";
import { LogoutUsers } from "../../Redux/Users/action";
import { toast } from "react-toastify";
import axios from "axios";
import userIcons from "../../assets/userimage.jpg";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/user/userDetails",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleLogout = () => {
    dispatch(LogoutUsers());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="font-poppins min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="font-poppins min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="font-poppins min-h-screen bg-gray-50 flex mt-5 relative">
      {/* Sidebar - Scrollable */}
      <div className="w-64 bg-white shadow-md h-screen overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-yellow-400 mb-6"
          >
            <IoMdArrowBack className="mr-2" />
            Back
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={userIcons}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-gray-500">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {user?.name}
            </h2>
            <p className="text-sm text-gray-500 text-center">{user?.email}</p>
          </div>
        </div>

        <nav className="space-y-2 px-6 pb-6">
          <Link
            to="/user/profile"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-400 hover:text-black rounded-lg transition-all"
          >
            <CgProfile className="mr-3" />
            My Profile
          </Link>
          <Link
            to="/user/orders"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-400 hover:text-black  rounded-lg transition-all"
          >
            <RiHistoryLine className="mr-3" />
            My Orders
          </Link>
          {/* <Link
            to="/user/change-password"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-400 hover:text-black  rounded-lg transition-all"
          >
            <RiLockPasswordLine className="mr-3" />
            Change Password
          </Link> */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-500 hover:text-black  rounded-lg transition-all cursor-pointer"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </div>

      {/* Logout Confirmation Modal with Glass Effect */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur Backdrop */}
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={() => setShowLogoutModal(false)}
          ></div>

          {/* Glass Modal */}
          <div className="relative bg-white bg-opacity-80 rounded-xl shadow-2xl border border-white border-opacity-30 backdrop-blur-md p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
