import React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Order placed successfully!");
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section - Shipping & Payment */}
        <div className="lg:w-2/3">
          <form
            onSubmit={handleSubmit}
            className="bg-white backdrop-blur-lg bg-opacity-80 shadow-2xl rounded-2xl p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Shipping Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-style"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">
                  Address
                </label>
                <input
                  type="text"
                  className="input-style"
                  placeholder="123 Main St"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">City</label>
                <input
                  type="text"
                  className="input-style"
                  placeholder="New York"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  className="input-style"
                  placeholder="10001"
                  required
                />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-6 text-gray-800">
              Payment Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  className="input-style"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">
                  Expiration Date
                </label>
                <input
                  type="text"
                  className="input-style"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">CVV</label>
                <input
                  type="text"
                  className="input-style"
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 transition duration-200"
            >
              <span className="text-lg font-semibold">Place Order</span>
            </button>
          </form>
        </div>

        {/* Right Section - Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white backdrop-blur-lg bg-opacity-80 shadow-2xl rounded-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800 font-semibold">₹2,499.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800 font-semibold">Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹2,499.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind Custom Styles */}
      <style>{`
        .input-style {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(209, 213, 219, 0.5);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
          padding: 12px;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-size: 16px;
        }
        .input-style:focus {
          outline: none;
          box-shadow: 0 0 10px rgba(0, 132, 255, 0.5);
          border-color: rgba(0, 132, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
