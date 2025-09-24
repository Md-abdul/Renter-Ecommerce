import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import backgroundImage from "../../../assets/wave.png";
// import logo from "../../../assets/ranter-website-logo.png"

const Footer = () => {
  return (
    <div
      className="relative bg-yellow-400 lg:bg-transparent text-black py-20 px-6 -mb-20"
      
    >
      {/* Add a div for the background that will be hidden on small screens */}
      <div
        className="hidden lg:block absolute inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-8 -mt-10 sm:mt-80">
        
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
          <p className="text-gray-800">Phone: +91 8779811198</p>
        </div>

        {/* Exclusive Section */}
        <div className="w-full sm:w-auto">
          <h4 className="mb-3 text-lg font-semibold">Exclusive</h4>
          <p className="text-gray-800">Subscribe</p>
          <p className="text-gray-800">Get 10% off your first order</p>
        </div>
      </div>

      {/* Shipping Policy Section */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-black">
        <h4 className="mb-4 text-lg font-semibold text-center">📦 Shipping Policy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          
          {/* Shipping Rates & Times */}
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold mb-2 flex items-center">
                <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                Shipping Rates
              </h5>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>• Rates calculated at checkout based on weight & location</li>
                <li>• Free shipping offers available during promotions</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2 flex items-center">
                <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                Shipping Times
              </h5>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>• Processing: 1-2 business days</li>
                <li>• Delivery: 4-7 business days within India</li>
                <li>• Delays notified promptly</li>
              </ul>
            </div>
          </div>

          {/* International Shipping & Order Tracking */}
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold mb-2 flex items-center">
                <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                International Shipping
              </h5>
              <p className="text-gray-700 ml-4">
                • Currently we only ship within India
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2 flex items-center">
                <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                Order Tracking
              </h5>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>• Tracking number sent via email/SMS</li>
                <li>• Online status tracking available 24/7</li>
              </ul>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h5 className="font-semibold mb-2 text-amber-800">💡 Important Note</h5>
              <p className="text-amber-700 text-xs">
                All orders are processed within India only. For any shipping inquiries, 
                contact our support team at info.ranter@gmail.com
              </p>
            </div>
            
            <div className="text-xs text-gray-600">
              <p>📞 Need help with shipping? Call +91 8779811198</p>
              <p>⏰ Support available: Mon-Sat, 10AM-7PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Social Links */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col sm:flex-row justify-between items-center px-6 lg:-mb-2.5">
        <p className="text-gray-700 text-sm">
          &copy; Copyright Ranter Store 2025. All rights reserved
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