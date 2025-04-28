import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { format, addDays, isAfter } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

const UserOrders = () => {
  const { orders, fetchOrders, loading } = useCart();
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [exchangeSize, setExchangeSize] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-500 mr-2" />;
      case "processing":
        return <FiRefreshCw className="text-blue-500 mr-2" />;
      case "shipped":
        return <FiTruck className="text-indigo-500 mr-2" />;
      case "delivered":
        return <FiCheckCircle className="text-green-500 mr-2" />;
      case "cancelled":
        return <FiXCircle className="text-red-500 mr-2" />;
      default:
        return <FiClock className="text-gray-500 mr-2" />;
    }
  };

  const getStatusSteps = (status) => {
    const steps = [
      { id: 1, name: "Order Placed", status: "completed" },
      {
        id: 2,
        name: "Processing",
        status: status === "pending" ? "pending" : "completed",
      },
      {
        id: 3,
        name: "Shipped",
        status: ["pending", "processing"].includes(status)
          ? "pending"
          : status === "shipped" || status === "delivered"
          ? "completed"
          : "pending",
      },
      {
        id: 4,
        name: "Delivered",
        status: status === "delivered" ? "completed" : "pending",
      },
    ];

    if (status === "cancelled") {
      steps.forEach((step) => {
        if (step.id > 1) step.status = "cancelled";
      });
    }

    return steps;
  };

  const openReturnModal = (item) => {
    setSelectedItem(item);
    setReturnReason("");
    setShowReturnModal(true);
  };

  // 1. First, update the openExchangeModal function to properly fetch sizes:
  const openExchangeModal = async (item) => {
    try {
      setSelectedItem(item);
      setExchangeSize("");
      setReturnReason("");
  
      // Fetch available sizes for this product
      const response = await axios.get(
        `http://localhost:5000/api/products/${item.productId}/sizes`
      );

      // Correctly filter and map sizes
      const availableSizes = (response.data?.sizes || [])
        .filter((s) => s.available && s.size !== item.size)
        .map((s) => s.size);
  
      setAvailableSizes(availableSizes);
      console.log(availableSizes);

      setShowExchangeModal(true);
    } catch (error) {
      toast.error("Failed to fetch product sizes");
      console.error("Error fetching sizes:", error);
    }
  };
  

  const handleReturnRequest = async (type) => {
    try {
      if (!returnReason) {
        toast.error("Please provide a reason");
        return;
      }

      if (type === "exchange" && !exchangeSize) {
        toast.error("Please select a size for exchange");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/orders/${selectedItem.orderId}/return`,
        {
          itemId: selectedItem._id,
          type,
          reason: returnReason,
          exchangeSize: type === "exchange" ? exchangeSize : undefined,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(
        `${
          type === "return" ? "Return" : "Exchange"
        } request submitted successfully`
      );
      fetchOrders();
      setShowReturnModal(false);
      setShowExchangeModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      console.error("Error submitting request:", error);
    }
  };

  const cancelReturnRequest = async (orderId, itemId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/return/${itemId}`,
        { status: "cancelled" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Return request cancelled");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    }
  };

  // Also update the isReturnWindowOpen function to fix the logic:
  const isReturnWindowOpen = (order) => {
    if (order.status !== "delivered") return false;
    if (!order.updatedAt) return false;

    const deliveryDate = new Date(order.updatedAt);
    const returnDeadline = addDays(deliveryDate, 7);
    return isAfter(returnDeadline, new Date()); // Fixed logic - return window is open if deadline is after current date
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse text-lg">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
          <div className="max-w-md mx-auto">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4555/4555971.png"
              alt="No orders"
              className="w-32 h-32 mx-auto mb-6 opacity-80"
            />
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't placed any orders. Start shopping to see
              your orders here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt);
            const updatedDate = order.updatedAt
              ? new Date(order.updatedAt)
              : null;
            const estimatedDeliveryDate = addDays(orderDate, 7);
            const canReturn =
              order.status === "delivered" && isReturnWindowOpen(order);

            return (
              <div
                key={order._id}
                className="border rounded-lg overflow-hidden shadow-sm bg-white"
              >
                <div
                  className="px-6 py-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleOrder(order._id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <FiTruck className="text-gray-500 text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          {format(orderDate, "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(order.status)}
                        <span className="text-sm capitalize">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 mr-4">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                    {expandedOrder === order._id ? (
                      <FiChevronUp className="text-gray-500" />
                    ) : (
                      <FiChevronDown className="text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="p-6">
                    <div className="mb-8">
                      <h3 className="font-medium text-gray-700 mb-4">
                        Order Status
                      </h3>
                      <div className="relative">
                        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                        {getStatusSteps(order.status).map((step, index) => (
                          <div key={step.id} className="relative pl-10 pb-6">
                            <div
                              className={`absolute left-4 top-0 w-3 h-3 rounded-full -ml-1.5 
                              ${
                                step.status === "completed"
                                  ? "bg-green-500"
                                  : ""
                              }
                              ${step.status === "pending" ? "bg-gray-300" : ""}
                              ${step.status === "cancelled" ? "bg-red-500" : ""}
                            `}
                            ></div>
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium 
                                  ${
                                    step.status === "completed"
                                      ? "text-green-600"
                                      : ""
                                  }
                                  ${
                                    step.status === "pending"
                                      ? "text-gray-500"
                                      : ""
                                  }
                                  ${
                                    step.status === "cancelled"
                                      ? "text-red-600"
                                      : ""
                                  }
                                `}
                                >
                                  {step.name}
                                </p>
                                {index ===
                                  getStatusSteps(order.status).length - 1 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {order.status === "delivered" && updatedDate
                                      ? `Delivered on ${format(
                                          updatedDate,
                                          "MMM dd, yyyy"
                                        )}`
                                      : order.status === "cancelled"
                                      ? "Order was cancelled"
                                      : `Estimated delivery: ${format(
                                          estimatedDeliveryDate,
                                          "MMM dd, yyyy"
                                        )}`}
                                    {order.status === "delivered" && (
                                      <span className="block mt-1">
                                        {canReturn
                                          ? "Return window open (7 days from delivery)"
                                          : "Return window expired"}
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-3">
                          Shipping Address
                        </h3>
                        <div className="text-gray-600 space-y-1">
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} -{" "}
                            {order.shippingAddress.zipCode}
                          </p>
                          <p>Phone: {order.shippingAddress.phone}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-3">
                          Payment Information
                        </h3>
                        <div className="text-gray-600 space-y-3">
                          <div>
                            <p className="font-medium">Payment Method</p>
                            <p className="capitalize">{order.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="font-medium">Payment Status</p>
                            <p className="text-green-600">Paid</p>
                          </div>
                          <div>
                            <p className="font-medium">Total Amount</p>
                            <p className="text-lg font-semibold">
                              ₹{order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-4">
                        Order Items
                      </h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-start border-b pb-4"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded mr-4 border"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 hover:text-yellow-600 transition">
                                {item.name}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1">
                                Qty: {item.quantity}
                              </p>
                              <p className="text-gray-600 text-sm">
                                Size: {item.size || "Standard"}
                              </p>
                              {item.returnRequest && (
                                <div className="mt-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      item.returnRequest.status === "requested"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : item.returnRequest.status ===
                                          "approved"
                                        ? "bg-blue-100 text-blue-800"
                                        : item.returnRequest.status ===
                                          "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {item.returnRequest.type === "return"
                                      ? "Return"
                                      : "Exchange"}{" "}
                                    {item.returnRequest.status}
                                  </span>
                                  {item.returnRequest.status ===
                                    "requested" && (
                                    <button
                                      onClick={() =>
                                        cancelReturnRequest(order._id, item._id)
                                      }
                                      className="ml-2 text-xs text-red-600 hover:text-red-800"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  {item.returnRequest.exchangeSize && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Exchange to:{" "}
                                      {item.returnRequest.exchangeSize}
                                    </div>
                                  )}
                                  {item.returnRequest.status === "rejected" && (
                                    <div className="text-xs text-red-600 mt-1">
                                      Your request was rejected
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-gray-900 font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                            {order.status === "delivered" && (
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() =>
                                    openReturnModal({
                                      ...item,
                                      orderId: order._id,
                                    })
                                  }
                                  className="text-sm text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded"
                                >
                                  Return
                                </button>
                                <button
                                  onClick={() =>
                                    openExchangeModal({
                                      ...item,
                                      orderId: order._id,
                                    })
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded"
                                >
                                  Exchange
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-end">
                      <button
                        onClick={() =>
                          navigate(`/product/${order.items[0].productId}`)
                        }
                        className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
                      >
                        Buy it again
                        <FiArrowRight className="ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Return Modal */}
      {showReturnModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Request Return</h3>
            <div className="mb-4">
              <p className="font-medium mb-2">Item: {selectedItem.name}</p>
              <p className="text-sm text-gray-600">Size: {selectedItem.size}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Return
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows="3"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please specify the reason for return..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReturnRequest("return")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Exchange Modal */}
      {/* // 2. Update the Exchange Modal JSX to properly display sizes: */}
      {showExchangeModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Request Exchange</h3>
            <div className="mb-4">
              <p className="font-medium mb-2">Item: {selectedItem.name}</p>
              <p className="text-sm text-gray-600">
                Current Size: {selectedItem.size}
              </p>
            </div>

            {/* Size Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select New Size
              </label>
              {availableSizes.length > 0 ? (
                <select
                  className="w-full border border-gray-300 rounded p-2"
                  value={exchangeSize}
                  onChange={(e) => setExchangeSize(e.target.value)}
                  required
                >
                  <option value="">Select size</option>
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-red-500 text-sm">
                  No other sizes available for exchange
                </p>
              )}
            </div>

            {/* Reason for Exchange */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Exchange
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows="3"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please specify the reason for exchange..."
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExchangeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReturnRequest("exchange")}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                  availableSizes.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={availableSizes.length === 0}
              >
                Submit Exchange Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
