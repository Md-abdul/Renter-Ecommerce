import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { LuUserRound } from "react-icons/lu";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import navdata from "./NavbarLinks"; // Import navdata from NavbarLinks.jsx

export const TopNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

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

  const navData = navdata(); // Call the navdata function

  return (
    <div className="font-poppins">
      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isSticky ? "bg-white shadow-lg" : "bg-white/10 backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto px-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={"/"}>
              <h1 className="text-2xl font-bold">
                <span className="text-gray-700">Re</span>nter
              </h1>
            </Link>
          </div>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex flex-grow justify-center space-x-8">
            {navData[0].subItems.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="px-5 py-3 rounded-md hover:bg-gray-100 font-medium text-gray-700 transition-all duration-300 hover:shadow-md hover:border hover:border-gray-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Icons (User and Cart) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-700 transition-all duration-300"
            >
              <span className="text-lg font-medium">
                <LuUserRound className="w-6 h-6" strokeWidth={2.5} />
              </span>
            </Link>

            <Link
              to="/productCart/:_id"
              className="text-gray-700 hover:text-blue-700 relative transition-all duration-300"
            >
              <span className="text-lg font-medium">
                <PiShoppingCartSimpleBold
                  className="w-6 h-6"
                  strokeWidth={1.5}
                />
              </span>
            </Link>
          </div>

          {/* Mobile Toggle Button */}
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

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-25 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-4">
          {/* Close Button */}
          <button
            className="mb-4 p-2 rounded-md bg-gray-200 text-black hover:bg-gray-400 transition-all duration-300"
            onClick={toggleDrawer}
          >
            <IoMdClose />
          </button>

          {/* Drawer Links */}
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
