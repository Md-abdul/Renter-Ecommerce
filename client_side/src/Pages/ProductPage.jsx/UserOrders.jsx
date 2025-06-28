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
  FiPackage,
  FiCreditCard,
  FiHome,
  FiInfo,
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
  const [exchangeColor, setExchangeColor] = useState("");
  const [availableColors, setAvailableColors] = useState([]);

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

  const openExchangeModal = async (item) => {
    try {
      setSelectedItem(item);
      setExchangeSize("");
      setExchangeColor("");
      setReturnReason("");

      const productResponse = await axios.get(
        `https://renter-ecommerce-1.onrender.com/api/products/${item.productId}`
      );

      const product = productResponse.data;

      const availableColors = product.colors
        .filter((c) => c.name !== item.color)
        .map((c) => c.name);

      const availableSizes = product.sizes
        .filter((s) => s.available && s.size !== item.size)
        .map((s) => s.size);

      setAvailableColors(availableColors);
      setAvailableSizes(availableSizes);
      setShowExchangeModal(true);
    } catch (error) {
      toast.error("Failed to fetch product details");
      console.error("Error fetching product:", error);
    }
  };

  const handleReturnRequest = async (type) => {
    try {
      if (!returnReason) {
        toast.error("Please provide a reason");
        return;
      }

      if (type === "exchange" && (!exchangeSize || !exchangeColor)) {
        toast.error("Please select both color and size for exchange");
        return;
      }

      const response = await axios.post(
        `https://renter-ecommerce-1.onrender.com/api/orders/${selectedItem.orderId}/return`,
        {
          itemId: selectedItem._id,
          type,
          reason: returnReason,
          exchangeSize: type === "exchange" ? exchangeSize : undefined,
          exchangeColor: type === "exchange" ? exchangeColor : undefined,
          exchangeProductId:
            type === "exchange" ? selectedItem.productId : undefined,
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
      if (
        error.response?.data?.message ===
        "Active request already exists for this item"
      ) {
        const existingRequest = error.response.data.existingRequest;

        let errorMessage = "An active request already exists for this item";
        if (existingRequest.type && existingRequest.status) {
          errorMessage = `You already have a ${existingRequest.type} request (status: ${existingRequest.status})`;
          if (existingRequest.requestedAt) {
            errorMessage += ` submitted on ${new Date(
              existingRequest.requestedAt
            ).toLocaleDateString()}`;
          }
        }

        toast.error(errorMessage, { autoClose: 7000 });
        fetchOrders();
      } else {
        toast.error(
          error.response?.data?.message || "Failed to submit request"
        );
      }
      console.error("Error submitting request:", error);
    }
  };

  const cancelReturnRequest = async (orderId, itemId) => {
    try {
      const response = await axios.put(
        `https://renter-ecommerce-1.onrender.com/api/orders/${orderId}/return/${itemId}`,
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

  const isReturnWindowOpen = (order) => {
    if (order.status !== "delivered") return false;
    if (!order.updatedAt) return false;

    const deliveryDate = new Date(order.updatedAt);
    const returnDeadline = addDays(deliveryDate, 7);
    return isAfter(returnDeadline, new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading your orders...
          </h2>
          <p className="text-gray-500 mt-1">
            Please wait while we fetch your order details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Your Orders
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
          >
            Continue Shopping
            <FiArrowRight className="ml-2" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100">
                <FiPackage className="h-12 w-12 text-yellow-500" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                No Orders Yet
              </h2>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Your order history is empty. Start shopping to see your orders
                here.
              </p>
              <div className="mt-8">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all"
                >
                  Browse Products
                </button>
              </div>
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
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <div
                    className="px-6 py-5 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrder(order._id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                        <FiPackage className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(orderDate, "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium capitalize text-gray-700">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900 mr-4">
                        ₹{Math.round(order.totalAmount.toFixed(2))}
                      </span>
                      {expandedOrder === order._id ? (
                        <FiChevronUp className="text-gray-500 h-5 w-5" />
                      ) : (
                        <FiChevronDown className="text-gray-500 h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {expandedOrder === order._id && (
                    <div className="p-6 space-y-8">
                      {/* Order Status Timeline */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <FiTruck className="mr-2 text-indigo-500" />
                          Order Status
                        </h3>
                        <div className="relative">
                          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                          {getStatusSteps(order.status).map((step, index) => (
                            <div
                              key={step.id}
                              className="relative pl-10 pb-8 last:pb-0"
                            >
                              <div
                                className={`absolute left-4 top-0 w-3 h-3 rounded-full -ml-1.5 mt-1.5
                                ${
                                  step.status === "completed"
                                    ? "bg-green-500 ring-4 ring-green-100"
                                    : ""
                                }
                                ${
                                  step.status === "pending"
                                    ? "bg-gray-300 ring-4 ring-gray-100"
                                    : ""
                                }
                                ${
                                  step.status === "cancelled"
                                    ? "bg-red-500 ring-4 ring-red-100"
                                    : ""
                                }
                              `}
                              ></div>
                              <div className="flex items-start">
                                <div className="flex-1">
                                  <p
                                    className={`text-base font-medium 
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
                                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                                      {order.status === "delivered" &&
                                      updatedDate ? (
                                        <p className="flex items-center">
                                          <FiCheckCircle className="mr-1.5 text-green-500" />
                                          Delivered on{" "}
                                          {format(updatedDate, "MMM dd, yyyy")}
                                        </p>
                                      ) : order.status === "cancelled" ? (
                                        <p className="flex items-center">
                                          <FiXCircle className="mr-1.5 text-red-500" />
                                          Order was cancelled
                                        </p>
                                      ) : (
                                        <p className="flex items-center">
                                          <FiInfo className="mr-1.5 text-blue-500" />
                                          Estimated delivery:{" "}
                                          {format(
                                            estimatedDeliveryDate,
                                            "MMM dd, yyyy"
                                          )}
                                        </p>
                                      )}
                                      {order.status === "delivered" && (
                                        <p
                                          className={`flex items-center ${
                                            canReturn
                                              ? "text-green-600"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {canReturn ? (
                                            <>
                                              <FiCheckCircle className="mr-1.5 text-green-500" />
                                              Return window open (7 days from
                                              delivery)
                                            </>
                                          ) : (
                                            <>
                                              <FiXCircle className="mr-1.5 text-gray-400" />
                                              Return window expired
                                            </>
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Shipping Address */}
                        <div className="space-y-2 text-gray-700">
                          <p className="font-medium">
                            {order.shippingAddress.name}
                          </p>
                          <p>{order.shippingAddress.address.street}</p>
                          <p>
                            {order.shippingAddress.address.city},{" "}
                            {order.shippingAddress.address.state} -{" "}
                            {order.shippingAddress.address.zipCode}
                          </p>
                          <p className="mt-3">
                            <span className="font-medium">Phone:</span>{" "}
                            {order.shippingAddress.phoneNumber}
                          </p>
                          {order.shippingAddress.address.alternatePhone && (
                            <p>
                              <span className="font-medium">Alternate:</span>{" "}
                              {order.shippingAddress.address.alternatePhone}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 capitalize">
                            ({order.shippingAddress.address.addressType}{" "}
                            address)
                          </p>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiCreditCard className="mr-2 text-indigo-500" />
                            Payment Information
                          </h3>
                          <div className="space-y-4 text-gray-700">
                            <div>
                              <p className="font-medium">Payment Method</p>
                              <p className="capitalize text-red-600 font-medium">
                                {order.paymentMethod}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Payment Status</p>
                              <p className="text-green-600 font-medium">
                                {order.paymentMethod === "cod"
                                  ? "Pending"
                                  : "Done"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Total Amount</p>
                              <p className="text-xl font-bold text-gray-900">
                                ₹{Math.round(order.totalAmount.toFixed(2))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <FiPackage className="mr-2 text-indigo-500" />
                          Order Items
                        </h3>
                        <div className="space-y-6">
                          {order.items.map((item) => (
                            <div
                              key={item.productId}
                              className="flex flex-col sm:flex-row items-start border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                            >
                              <div className="flex-shrink-0 mb-4 sm:mb-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    navigate(`/product/${item.productId}`)
                                  }
                                />
                              </div>
                              <div className="flex-1 sm:ml-6">
                                <h4
                                  className="font-semibold text-gray-900 hover:text-yellow-600 transition-colors cursor-pointer"
                                  onClick={() =>
                                    navigate(`/product/${item.productId}`)
                                  }
                                >
                                  {item.name}
                                </h4>
                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                  <p>Quantity: {item.quantity}</p>
                                  <p>Size: {item.size || "Standard"}</p>
                                  <p>Color: {item.color}</p>
                                </div>
                                {item.returnRequest && (
                                  <div className="mt-3">
                                    <div
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-opacity-20 
                                      ${
                                        item.returnRequest.status ===
                                        "requested"
                                          ? "bg-yellow-500 text-yellow-800"
                                          : item.returnRequest.status ===
                                            "approved"
                                          ? "bg-blue-500 text-blue-800"
                                          : item.returnRequest.status ===
                                            "completed"
                                          ? "bg-green-500 text-green-800"
                                          : "bg-red-500 text-red-800"
                                      }`}
                                    >
                                      {item.returnRequest.type === "return"
                                        ? "Return"
                                        : "Exchange"}{" "}
                                      {item.returnRequest.status}
                                    </div>
                                    {["requested", "approved"].includes(
                                      item.returnRequest.status
                                    ) && (
                                      <button
                                        onClick={() =>
                                          cancelReturnRequest(
                                            order._id,
                                            item._id
                                          )
                                        }
                                        className="ml-3 text-xs font-medium text-red-600 hover:text-red-800"
                                      >
                                        Cancel Request
                                      </button>
                                    )}
                                    {item.returnRequest.type === "exchange" && (
                                      <div className="text-xs text-blue-600 mt-2">
                                        Exchange to:{" "}
                                        <span className="font-medium">
                                          {item.returnRequest.exchangeColor}
                                        </span>
                                        , Size:{" "}
                                        <span className="font-medium">
                                          {item.returnRequest.exchangeSize}
                                        </span>
                                      </div>
                                    )}
                                    {item.returnRequest.status ===
                                      "rejected" && (
                                      <div className="text-xs text-red-600 mt-2">
                                        <span className="font-medium">
                                          Note:
                                        </span>{" "}
                                        Your request was rejected
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end mt-4 sm:mt-0 ml-auto">
                                {/* <span className="font-bold text-gray-900 text-lg">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span> */}
                                {order.status === "delivered" && (
                                  <div className="flex space-x-3 mt-4">
                                    <button
                                      onClick={() =>
                                        openReturnModal({
                                          ...item,
                                          orderId: order._id,
                                        })
                                      }
                                      className="text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
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
                                      className="text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                      Exchange
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
                        <button
                          onClick={() =>
                            navigate(`/product/${order.items[0].productId}`)
                          }
                          className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center mb-4 sm:mb-0"
                        >
                          Buy it again
                          <FiArrowRight className="ml-1.5" />
                        </button>
                        <div className="text-sm text-gray-500">
                          Order ID: {order._id}
                        </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blur Backdrop */}
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={() => setShowReturnModal(false)}
            ></div>

            {/* Glass Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-lg w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Request Return
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedItem.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Size: {selectedItem.size} | Color: {selectedItem.color}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {selectedItem.quantity}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please specify the reason for return..."
                  required
                />
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Return requests are typically processed within 3-5
                      business days. You'll receive instructions for returning
                      the item after approval.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  onClick={() => handleReturnRequest("return")}
                >
                  Submit Return Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Modal */}
        {showExchangeModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blur Backdrop */}
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={() => setShowExchangeModal(false)}
            ></div>

            {/* Glass Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-lg w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Request Exchange
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedItem.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Current: {selectedItem.color}, Size: {selectedItem.size}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {selectedItem.quantity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Color <span className="text-red-500">*</span>
                </label>
                {availableColors.length > 0 ? (
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={exchangeColor}
                    onChange={(e) => setExchangeColor(e.target.value)}
                    required
                  >
                    <option value="">Select color</option>
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiXCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          No other colors available for exchange
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Size <span className="text-red-500">*</span>
                </label>
                {availableSizes.length > 0 ? (
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiXCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          No other sizes available for exchange
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reason for Exchange */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Exchange <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please specify the reason for exchange..."
                  required
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Exchange requests are typically processed within 3-5
                      business days. You'll receive instructions for returning
                      the item and getting your replacement after approval.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowExchangeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReturnRequest("exchange")}
                  className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                    availableSizes.length === 0 || availableColors.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    availableSizes.length === 0 || availableColors.length === 0
                  }
                >
                  Submit Exchange Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
