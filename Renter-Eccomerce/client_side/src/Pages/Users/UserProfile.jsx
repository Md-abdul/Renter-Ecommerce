// import React from "react";
// import { Link, Outlet, useNavigate } from "react-router-dom";
// import { CgProfile } from "react-icons/cg";
// import { FiLogOut } from "react-icons/fi";
// import { RiLockPasswordLine, RiHistoryLine } from "react-icons/ri";
// import { IoMdArrowBack } from "react-icons/io";
// import { useDispatch } from "react-redux";
// import { LogoutUsers } from "../../Redux/Users/action";
// import { toast } from "react-toastify";
// import userIcons from "../../assets/userimage.jpg";
// const UserProfile = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const handleLogout = () => {
//     dispatch(LogoutUsers());
//     toast.success("Logged out successfully");
//     navigate("/login");
//   };

//   return (
//     <div className="font-poppins min-h-screen bg-gray-50">
//       <div className="flex">
//         {/* Sidebar */}
//         <div className="w-64 bg-white shadow-md fixed h-full">
//           <div className="p-6">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center text-gray-600 hover:text-yellow-400 mb-6"
//             >
//               <IoMdArrowBack className="mr-2" />
//               Back
//             </button>

//             <div className="flex flex-col items-center mb-8">
//               <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
//                 {user?.profileImage ? (
//                   <img
//                     src={userIcons}
//                     alt="Profile"
//                     className="w-full h-full rounded-full object-cover"
//                   />
//                 ) : (
//                   <span className="text-3xl text-gray-500">
//                     {user?.name?.charAt(0).toUpperCase()}
//                   </span>
//                 )}
//               </div>
//               <h2 className="text-xl font-semibold text-gray-800">
//                 {user?.name}
//               </h2>
//               <p className="text-sm text-gray-500">{user?.email}</p>
//             </div>

//             <nav className="space-y-2">
//               <Link
//                 to="/user/profile"
//                 className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
//               >
//                 <CgProfile className="mr-3" />
//                 My Profile
//               </Link>
//               <Link
//                 to="/user/orders"
//                 // to="/order"
//                 className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
//               >
//                 <RiHistoryLine className="mr-3" />
//                 My Orders
//               </Link>
//               <Link
//                 to="/user/change-password"
//                 className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
//               >
//                 <RiLockPasswordLine className="mr-3" />
//                 Change Password
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
//               >
//                 <FiLogOut className="mr-3" />
//                 Logout
//               </button>
//             </nav>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="ml-64 flex-1 p-8">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { RiLockPasswordLine, RiHistoryLine } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { useDispatch } from "react-redux";
import { LogoutUsers } from "../../Redux/Users/action";
import { toast } from "react-toastify";
import userIcons from "../../assets/userimage.jpg";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    dispatch(LogoutUsers());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="font-poppins min-h-screen bg-gray-50 flex mt-5">
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
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
          >
            <CgProfile className="mr-3" />
            My Profile
          </Link>
          <Link
            to="/user/orders"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
          >
            <RiHistoryLine className="mr-3" />
            My Orders
          </Link>
          <Link
            to="/user/change-password"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
          >
            <RiLockPasswordLine className="mr-3" />
            Change Password
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-all"
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
    </div>
  );
};

export default UserProfile;