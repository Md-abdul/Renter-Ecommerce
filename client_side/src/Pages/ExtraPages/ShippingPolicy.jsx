import React from "react";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📦 Shipping Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            At Ranter Store, we aim to deliver your orders quickly and reliably.
            Please review our shipping terms below.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Shipping Rates Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Shipping Rates
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>
                      Shipping rates are calculated at checkout based on the
                      weight of your order and delivery location.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>
                      We often run free shipping offers within India on
                      promotional campaigns – keep an eye out!
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Shipping Times Section */}
          <div className="p-8 border-b border-gray-200 bg-gray-50">
            <div className="flex items-start mb-6">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">⏰</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Shipping Times
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      Orders are typically processed within{" "}
                      <strong>1-2 business days</strong>.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      Standard delivery within India usually takes{" "}
                      <strong>4–7 business days</strong> depending on your
                      location.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      You will be notified if there is any unexpected delay in
                      processing your order.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* International Shipping Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start mb-6">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  International Shipping
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>
                      We currently <strong>do not offer</strong> international
                      shipping.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>
                      Orders can only be shipped and delivered{" "}
                      <strong>within India</strong>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Order Tracking Section */}
          <div className="p-8 bg-gray-50">
            <div className="flex items-start mb-6">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Order Tracking
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>
                      Once your order has shipped, you will receive a tracking
                      number via email/SMS.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>
                      You can use this tracking number to check your shipment
                      status online anytime.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-800 font-medium">
            💡 <strong>Note:</strong> All shipping times are estimates and may
            vary based on circumstances beyond our control.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
