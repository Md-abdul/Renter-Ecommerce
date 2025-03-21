import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { LuUserRound } from "react-icons/lu";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { useCart } from "../../../context/CartContext"; // Import Cart Context
import navdata from "./NavbarLinks";

export const TopNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { getTotalItems } = useCart(); // Get total items in cart
  const location = useLocation(); // Get current location

  const toggleDrawer = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navData = navdata();

  return (
    <div className="font-poppins">
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isSticky ? "bg-white shadow-lg" : "bg-white/10 backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto px-4">
          <div className="flex items-center">
            <Link to={"/"}>
              <h1 className="text-2xl font-bold">
                <span className="text-yellow-400">Re</span>nter
              </h1>
            </Link>
          </div>

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

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-700 transition-all duration-300"
            >
              <LuUserRound className="w-6 h-6" strokeWidth={2.5} />
            </Link>

            <Link
              to="/productCart/"
              className="relative text-gray-700 hover:text-blue-700 transition-all duration-300"
            >
              <PiShoppingCartSimpleBold className="w-6 h-6" strokeWidth={1.5} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>

          <button
            className="flex md:hidden p-2 rounded-md bg-gray-200 text-black hover:bg-gray-400 transition-all duration-300"
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
  );
};
