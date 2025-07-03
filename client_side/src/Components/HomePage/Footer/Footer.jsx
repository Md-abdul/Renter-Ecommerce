import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import backgroundImage from "../../../assets/wave.png";

const Footer = () => {
  return (
    <div
      className="relative bg-yellow-400 lg:bg-transparent text-black py-20 px-6 -mb-20"
      style={
        {
          // Remove backgroundImage from inline style and handle it via CSS
          // border: "2px solid red",/
          // marginTop:"-10px"
        }
      }
    >
      {/* Add a div for the background that will be hidden on small screens */}
      <div
        className="hidden lg:block absolute inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-8 -mt-10 sm:mt-30">
        {/* Account Section */}
        <div className="w-full sm:w-auto">
          <h4 className="mb-3 text-lg font-semibold">Account</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="/womens"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Woman's Wears
              </a>
            </li>
            <li>
              <a
                href="/mens"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Men's Wears
              </a>
            </li>
            <li>
              <a
                href="/aboutpage"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Login / Register
              </a>
            </li>
            <li>
              <a
                href="/productCart"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Cart
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Links Section */}
        <div className="w-full sm:w-auto">
          <h4 className="mb-3 text-lg font-semibold">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="/term-of-privacy"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/term-of-uses"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Terms Of Use
              </a>
            </li>
            <li>
              <a
                href="/term-of-return"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Return Policy
              </a>
            </li>
            <li>
              <a
                href="/contactpage"
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Support Section */}
        <div className="w-full sm:w-auto">
          <h4 className="mb-3 text-lg font-semibold">Support</h4>
          {/* <p className="text-gray-800">
            111 Bijoy Sarani, Mumbai, DH 1515, India
          </p> */}
          <p className="text-gray-800">
            shop 10 Ground Floor Ghansoli   
          </p>
          <p className="text-gray-800">
             Howrah Chowk sector 3 Ambika
          </p>
          <p className="text-gray-800">
            Darshan SocietyThane, Maharashtra,
          </p>
          <p className="text-gray-800">
            400701, India
          </p>
          <p className="text-gray-800">Email: info.ranter@gmail.com</p>
          <p className="text-gray-800">Phone: +91 9029297732</p>
        </div>

        {/* Exclusive Section */}
        <div className="w-full sm:w-auto">
          <h4 className="mb-3 text-lg font-semibold">Exclusive</h4>
          <p className="text-gray-800">Subscribe</p>
          <p className="text-gray-800">Get 10% off your first order</p>
          <div className="flex mt-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-400 rounded-l-md focus:outline-none"
            />
            <button className="px-4 py-2 bg-black text-white rounded-r-md hover:bg-gray-900 transition">
              &#x27A4;
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 flex flex-col sm:flex-row justify-between items-center px-6 lg:-mb-2.5">
        <p className="text-gray-700 text-sm">
          &copy; Copyright Ranter 2025. All rights reserved
        </p>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <a
            href="#"
            className="text-gray-700 text-xl hover:scale-110 transition"
          >
            <FaFacebookF />
          </a>
          <a
            href="#"
            className="text-gray-700 text-xl hover:scale-110 transition"
          >
            <FaTwitter />
          </a>
          <a
            href="#"
            className="text-gray-700 text-xl hover:scale-110 transition"
          >
            <FaInstagram />
          </a>
          <a
            href="#"
            className="text-gray-700 text-xl hover:scale-110 transition"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
