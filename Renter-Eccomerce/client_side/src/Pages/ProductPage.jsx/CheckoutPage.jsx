import React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert("Order placed successfully!");
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Shipping Information
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700">Address</label>
                <input
                  type="text"
                  className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700">City</label>
                <input
                  type="text"
                  className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700">Zip Code</label>
                <input
                  type="text"
                  className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">
              Payment Information
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-gray-700">Card Number</label>
                <input
                  type="text"
                  className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700">Expiration Date</label>
                <input
                  type="text"
                  className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700">CVV</label>
                <input
                  type="text"
                  className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
            >
              Place Order
            </button>
          </form>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{/* Add total price here */}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">₹{/* Add total price here */}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;