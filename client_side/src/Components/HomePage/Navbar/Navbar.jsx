import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { LuUserRound } from "react-icons/lu";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import { LogoutUsers } from "../../../Redux/Users/action";
import { toast } from "react-toastify";
import navdata from "./NavbarLinks";
import { useCart } from "../../../context/CartContext";

export const TopNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth, token } = useSelector((state) => state.UsersReducer);
  const [userName, setUserName] = useState("");
  const location = useNavigate();
  const { cart } = useCart();
  const toggleDrawer = () => setIsOpen(!isOpen);

  // Hover handlers for profile dropdown
  const handleProfileMouseEnter = () => setShowProfileDropdown(true);
  const handleProfileMouseLeave = () => {
    setTimeout(() => {
      if (!document.querySelector(".profile-dropdown:hover")) {
        setShowProfileDropdown(false);
      }
    }, 100);
  };

  // Keep dropdown open if mouse is inside it
  const handleDropdownMouseEnter = () => setShowProfileDropdown(true);
  const handleDropdownMouseLeave = () => setShowProfileDropdown(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isAuth && token) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setUserName(user.name);
      }
    } else {
      setUserName("");
    }
  }, [isAuth, token]);

  const handleLogout = () => {
    dispatch(LogoutUsers());
    toast.success("Logged out successfully");
    navigate("/login");
    setShowProfileDropdown(false);
  };

  const handleCartClick = () => {
    if (!isAuth) {
      toast.error("Please login first to access the cart.");
      navigate("/login");
    } else {
      navigate("/productCart");
    }
  };

  const handleProfileClick = () => {
    navigate("/user/profile");
    setShowProfileDropdown(false);
  };

  const handleOrdersClick = () => {
    navigate("/user/orders");
    setShowProfileDropdown(false);
  };

  const navData = navdata();

  return (
    <div className="font-poppins">
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isSticky ? "bg-white shadow-lg" : "bg-white backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto px-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={"/"}>
              <h1 className="text-2xl font-bold">
                <span className="text-yellow-400">Ra</span>nter
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex flex-grow justify-center space-x-8">
            {navData[0].subItems.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className={`px-5 py-3 rounded-md hover:bg-gray-100 font-medium text-gray-700 transition-all duration-300 hover:shadow-md hover:border hover:border-gray-200 ${
                  location.pathname === item.link
                    ? "border-b-2 border-yellow-400"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop User/Cart Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuth ? (
              <div
                className="relative"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
              >
                <div className="flex items-center space-x-2 cursor-pointer group hover:shadow-md px-3 py-3 rounded-md">
                  <span className="text-gray-700 font-medium group-hover:text-yellow-400 transition-all duration-300">
                    {userName}
                  </span>
                  <div className="p-2 rounded-full group-hover:bg-gray-100 transition-all duration-300">
                    <CgProfile className="w-5 h-5 text-gray-700 group-hover:text-yellow-400 transition-all duration-300" />
                  </div>
                </div>

{/* hello  */}


                {showProfileDropdown && (
                  <div
                    className="profile-dropdown absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 origin-top-right transform-gpu"
                    style={{
                      animation: "slideIn 0.3s ease-out forwards",
                      transformOrigin: "top right",
                    }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <style jsx>{`
                      @keyframes slideIn {
                        from {
                          opacity: 0;
                          transform: translateX(20px);
                        }
                        to {
                          opacity: 1;
                          transform: translateX(0);
                        }
                      }
                    `}</style>
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="block w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-yellow-500 transition-all duration-200 flex items-center cursor-pointer"
                      >
                        <CgProfile className="mr-3 text-gray-500" />
                        My Profile
                      </button>
                      <button
                        onClick={handleOrdersClick}
                        className="block w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-yellow-500 transition-all duration-200 flex items-center cursor-pointer"
                      >
                        <PiShoppingCartSimpleBold className="mr-3 text-gray-500" />
                        My Orders
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-all duration-200 flex items-center cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-3 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-yellow-400 transition-all duration-300 p-2 rounded-full hover:bg-gray-100"
              >
                <span className="text-lg font-medium">
                  <LuUserRound className="w-6 h-6" strokeWidth={2.5} />
                </span>
              </Link>
            )}

            <button
              onClick={handleCartClick}
              className="text-gray-700 hover:text-yellow-400 relative transition-all duration-300 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-lg font-medium">
                <PiShoppingCartSimpleBold
                  className="w-6 h-6"
                  strokeWidth={1.5}
                />
                {isAuth && cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Mobile Icons */}
          <div className="flex md:hidden items-center space-x-4">
            {/* Mobile Cart Icon */}
            <button
              onClick={handleCartClick}
              className="text-gray-700 hover:text-yellow-400 relative transition-all duration-300 p-2 rounded-full hover:bg-gray-100"
            >
              <PiShoppingCartSimpleBold className="w-6 h-6" strokeWidth={1.5} />
              {isAuth && cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile User Icon */}
            {isAuth ? (
              <button
                onClick={handleProfileClick}
                className="text-gray-700 hover:text-yellow-400 transition-all duration-300 p-2 rounded-full hover:bg-gray-100"
              >
                <CgProfile className="w-6 h-6" />
              </button>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-yellow-400 transition-all duration-300 p-2 rounded-full hover:bg-gray-100"
              >
                <LuUserRound className="w-6 h-6" strokeWidth={2.5} />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="p-2 rounded-md bg-gray-200 text-black hover:bg-gray-400 transition-all duration-300"
              onClick={toggleDrawer}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer - Only for navigation links */}
      <div
        className={`fixed inset-0 bg-opacity-25 z-50 transform transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <Link to="/" onClick={toggleDrawer}>
              <h1 className="text-2xl font-bold">
                <span className="text-yellow-400">Ra</span>nter
              </h1>
            </Link>
            <button
              className="p-2 rounded-md bg-gray-200 text-black hover:bg-gray-400 transition-all duration-300"
              onClick={toggleDrawer}
            >
              <IoMdClose />
            </button>
          </div>

          <div className="space-y-4">
            {navData[0].subItems.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="block px-5 py-3 rounded-md hover:bg-gray-100 font-medium text-gray-700 transition-all duration-300 hover:shadow-md hover:border hover:border-gray-200"
                onClick={toggleDrawer}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};