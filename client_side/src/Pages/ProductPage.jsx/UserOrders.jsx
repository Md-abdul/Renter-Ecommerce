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
  FiX,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { LiaRupeeSignSolid } from "react-icons/lia";
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingRequestType, setPendingRequestType] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState(1);

  // payment & bank detils data
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    accountName: "",
    ifscCode: "",
    bankName: "",
  });

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
    if (
      isReturnOrExchangeActive(item, "return") ||
      isReturnOrExchangeActive(item, "exchange")
    ) {
      toast.error("You already have an active request for this item");
      return;
    }
    setSelectedItem(item);
    setReturnReason("");
    setReturnQuantity(item.quantity); // Default to full quantity
    setShowReturnModal(true);
  };

  // Update the openExchangeModal function
  const openExchangeModal = async (item) => {
    if (
      isReturnOrExchangeActive(item, "return") ||
      isReturnOrExchangeActive(item, "exchange")
    ) {
      toast.error("You already have an active request for this item");
      return;
    }

    try {
      setSelectedItem(item);
      setExchangeSize("");
      setExchangeColor("");
      setReturnReason("");
      setReturnQuantity(item.quantity); // Default to full quantity

      const productResponse = await axios.get(
        `https://renter-ecommerce.vercel.app/api/products/${item.productId}`
      );

      const product = productResponse.data;
      const currentColorObj = product.colors.find((c) => c.name === item.color);
      const availableColors = product.colors
        .filter((c) => c.name !== item.color)
        .map((c) => c.name);
      const availableSizes = currentColorObj
        ? currentColorObj.sizes
            .filter((s) => s.size !== item.size && s.quantity > 0)
            .map((s) => s.size)
        : [];

      setAvailableColors(availableColors);
      setAvailableSizes(availableSizes);
      setShowExchangeModal(true);
    } catch (error) {
      toast.error("Failed to fetch product details");
      console.error("Error fetching product:", error);
    }
  };

  const handleReturnRequest = (type) => {
    if (!returnReason) {
      toast.error("Please provide a reason");
      return;
    }

   if (type === "exchange" && !exchangeSize && !exchangeColor) {
  toast.error("Please select at least color or size for exchange");
  return;
}


    setPendingRequestType(type);
    setShowConfirmationModal(true);
  };

  const cancelReturnRequest = async (orderId, itemId) => {
    try {
      const response = await axios.put(
        // `https://renter-ecommerce.vercel.app/api/orders/${orderId}/return/${itemId}`,
        `https://renter-ecommerce.vercel.app/api/orders/${orderId}/return/${itemId}`,
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

  // Add these helper functions inside the UserOrders component
  const isReturnOrExchangeActive = (item, type) => {
    if (!item.returnRequest) return false;
    // Only consider requests that are not completed, rejected, or cancelled
    const activeStatuses = [
      "requested",
      "approved",
      "processing",
      "pickuped",
      "shipped",
      "delivered",
      "refund_completed",
    ];
    return (
      item.returnRequest.type === type &&
      activeStatuses.includes(item.returnRequest.status)
    );
  };

  const isActionDisabled = (order, item, type) => {
    // Disable if return window is closed
    if (!isReturnWindowOpen(order)) return true;
    // Disable "return" if exchange is active, and vice versa
    if (type === "return" && isReturnOrExchangeActive(item, "exchange"))
      return true;
    if (type === "exchange" && isReturnOrExchangeActive(item, "return"))
      return true;
    return false;
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

  const confirmRequest = async () => {
    try {
      setShowConfirmationModal(false);

      const response = await axios.post(
        `https://renter-ecommerce.vercel.app/api/orders/${selectedItem.orderId}/return`,
        {
          itemId: selectedItem._id,
          type: pendingRequestType,
          reason: returnReason,
          exchangeSize:
            pendingRequestType === "exchange" ? exchangeSize : undefined,
          exchangeColor:
            pendingRequestType === "exchange" ? exchangeColor : undefined,
          exchangeProductId:
            pendingRequestType === "exchange"
              ? selectedItem.productId
              : undefined,
          requestedQuantity: returnQuantity, // Send the quantity
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(
        `${
          pendingRequestType === "return" ? "Return" : "Exchange"
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

  const submitPaymentDetails = async () => {
    // alert('skjflk')
    try {
      if (!selectedItem || !selectedItem.orderId || !selectedItem._id) {
        toast.error("Invalid order or item selection");

        console.error("Missing selectedItem info:");
        console.log("selectedItem:", selectedItem);
        return;
      }

      const token = localStorage.getItem("token");
      let paymentData = {};

      if (paymentMethod === "upi") {
        if (!upiId) {
          toast.error("Please enter UPI ID");
          return;
        }
        paymentData = { upiId };
      } else {
        if (
          !bankDetails.accountNumber ||
          !bankDetails.ifscCode ||
          !bankDetails.accountName
        ) {
          toast.error("Please fill all bank details");
          return;
        }
        paymentData = { bankAccount: bankDetails };
      }

      const response = await axios.post(
        `https://renter-ecommerce.vercel.app/api/orders/${selectedItem.orderId}/return/${selectedItem._id}/payment-details`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Payment details submitted successfully");
      setShowPaymentDetailsModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit payment details"
      );
      console.error("Error submitting payment details:", error);
    }
  };

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
        item.returnRequest.status === "requested"
          ? "bg-yellow-500 text-yellow-800"
          : item.returnRequest.status === "approved"
          ? "bg-blue-500 text-blue-800"
          : item.returnRequest.status === "processing"
          ? "bg-indigo-500 text-indigo-800"
          : item.returnRequest.status === "pickuped"
          ? "bg-purple-500 text-purple-800"
          : item.returnRequest.status === "shipped"
          ? "bg-teal-500 text-teal-800"
          : item.returnRequest.status === "delivered"
          ? "bg-green-500 text-green-800"
          : item.returnRequest.status === "refund_completed"
          ? "bg-green-600 text-green-900"
          : item.returnRequest.status === "completed"
          ? "bg-green-700 text-green-100"
          : "bg-red-500 text-red-800"
      }`}
                                    >
                                      {item.returnRequest.type === "return"
                                        ? "Return"
                                        : "Exchange"}{" "}
                                      {item.returnRequest.status
                                        ?.split("_")
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1)
                                        )
                                        .join(" ")}
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
                                        {/* Cancel Request---- */}
                                      </button>
                                    )}

                                    {item.returnRequest?.type && (
                                      <div className="text-xs text-blue-600 mt-2">
                                        {item.returnRequest.type ===
                                          "exchange" && (
                                          <>
                                            Exchange to:{" "}
                                            <span className="font-medium">
                                              {item.returnRequest.exchangeColor}
                                            </span>
                                            , Size:{" "}
                                            <span className="font-medium">
                                              {item.returnRequest.exchangeSize}
                                            </span>
                                            ,{" "}
                                          </>
                                        )}
                                        Quantity:{" "}
                                        <span className="font-medium">
                                          {item.returnRequest.requestedQuantity}
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

                                    {item.returnRequest.trackingNumber && (
                                      <div className="text-xs text-gray-600 mt-2 flex items-center">
                                        <FiTruck className="mr-1" />
                                        Tracking:{" "}
                                        {item.returnRequest.trackingNumber}
                                      </div>
                                    )}

                                    {item.returnRequest.status ===
                                      "refund_completed" && (
                                      <div className="text-xs text-green-600 mt-2">
                                        <span className="font-medium">
                                          Note:
                                        </span>{" "}
                                        Refund has been processed successfully
                                      </div>
                                    )}

                                    {item.returnRequest.status ===
                                      "completed" &&
                                      item.returnRequest.type ===
                                        "exchange" && (
                                        <div className="text-xs text-green-600 mt-2">
                                          <span className="font-medium">
                                            Note:
                                          </span>{" "}
                                          Exchange has been completed
                                          successfully
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
                                    {/* Return Button */}
                                    <button
                                      onClick={() => {
                                        if (
                                          isReturnOrExchangeActive(
                                            item,
                                            "return"
                                          ) ||
                                          isReturnOrExchangeActive(
                                            item,
                                            "exchange"
                                          )
                                        ) {
                                          toast.error(
                                            "You already have an active request for this item"
                                          );
                                          return;
                                        }
                                        openReturnModal({
                                          ...item,
                                          orderId: order._id,
                                        });
                                      }}
                                      className={`text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors
    ${
      isActionDisabled(order, item, "return")
        ? "opacity-50 cursor-not-allowed"
        : ""
    }
  `}
                                      disabled={isActionDisabled(
                                        order,
                                        item,
                                        "return"
                                      )}
                                    >
                                      Return
                                    </button>

                                    {/* Exchange Button */}
                                    <button
                                      onClick={() => {
                                        if (
                                          isReturnOrExchangeActive(
                                            item,
                                            "return"
                                          ) ||
                                          isReturnOrExchangeActive(
                                            item,
                                            "exchange"
                                          )
                                        ) {
                                          toast.error(
                                            "You already have an active request for this item"
                                          );
                                          return;
                                        }
                                        openExchangeModal({
                                          ...item,
                                          orderId: order._id,
                                        });
                                      }}
                                      className={`text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors
    ${
      isActionDisabled(order, item, "exchange")
        ? "opacity-50 cursor-not-allowed"
        : ""
    }
  `}
                                      disabled={isActionDisabled(
                                        order,
                                        item,
                                        "exchange"
                                      )}
                                    >
                                      Exchange
                                    </button>

                                    {/* // Update the return request status display to include a button for adding payment details */}
                                    {item.returnRequest?.status ===
                                      "approved" &&
                                      !item.returnRequest
                                        .paymentDetailsProvided && (
                                        <button
                                          onClick={() => {
                                            setSelectedItem({
                                              ...item,
                                              orderId: order._id,
                                              _id: item._id,
                                            });

                                            setShowPaymentDetailsModal(true);
                                          }}
                                          className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200"
                                        >
                                          Add Payment Details
                                        </button>
                                      )}

                                    {item.returnRequest
                                      ?.paymentDetailsProvided && (
                                      <div className="text-xs text-green-600 mt-2">
                                        <span className="font-medium">
                                          Payment Details:
                                        </span>{" "}
                                        Submitted on{" "}
                                        {new Date(
                                          item.returnRequest.paymentDetailsProvidedAt
                                        ).toLocaleDateString()}
                                      </div>
                                    )}
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
                        <div className="text-sm text-gray-500 font-bold">
                          Order ID: {order.orderNumber}
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

              {/* Add quantity selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Return (Max: {selectedItem.quantity})
                </label>

                <input
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  value={returnQuantity}
                  onChange={(e) =>
                    setReturnQuantity(
                      Math.min(
                        parseInt(e.target.value) || 1,
                        selectedItem.quantity
                      )
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={() => setShowExchangeModal(false)}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Request Exchange
                </h3>
                <button
                  onClick={() => setShowExchangeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Current Item */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    CURRENT ITEM
                  </h4>
                  <div className="flex items-start space-x-4">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {selectedItem.name}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <p className="text-gray-500">Color</p>
                          <p className="font-medium">{selectedItem.color}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Size</p>
                          <p className="font-medium">{selectedItem.size}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">{selectedItem.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-medium">
                            <span>₹{selectedItem.price?.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Options */}
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">
                    Exchange Options
                  </h4>

                  {/* Grid Layout for Exchange Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Color <span className="text-gray-400">(optional)</span>
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
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                          <div className="flex items-center">
                            <svg
                              className="h-5 w-5 text-red-400 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-sm text-red-700">
                              No other colors available
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Size Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Size <span className="text-gray-400">(optional)</span>
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
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                          <div className="flex items-center">
                            <svg
                              className="h-5 w-5 text-red-400 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-sm text-red-700">
                              No other sizes available
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quantity Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity to Exchange{" "}
                        <span className="text-gray-500">
                          (Max: {selectedItem.quantity})
                        </span>
                      </label>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            setReturnQuantity(Math.max(1, returnQuantity - 1))
                          }
                          className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-100 hover:bg-gray-200"
                          disabled={returnQuantity <= 1}
                        >
                          -
                        </button>
                        {/* <input
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  value={returnQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setReturnQuantity(Math.min(Math.max(value, 1), selectedItem.quantity));
                  }}
                  className="w-16 px-3 py-2 border-t border-b border-gray-300 text-center"
                /> */}
                        <input
                          type="number"
                          min="1"
                          max={selectedItem.quantity}
                          value={returnQuantity}
                          onChange={(e) =>
                            setReturnQuantity(
                              Math.min(
                                parseInt(e.target.value) || 1,
                                selectedItem.quantity
                              )
                            )
                          }
                          className="w-16 px-3 py-2 border-t border-b border-gray-300 text-center"
                        />

                        <button
                          onClick={() =>
                            setReturnQuantity(
                              Math.min(
                                selectedItem.quantity,
                                returnQuantity + 1
                              )
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200"
                          disabled={returnQuantity >= selectedItem.quantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reason for Exchange */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Exchange{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Please specify why you want to exchange this item..."
                      required
                    />
                  </div>
                </div>

                {/* Information Notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Exchange Process
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Your exchange request will be processed within 3-5
                        business days. Once approved, you'll receive return
                        instructions and tracking for your replacement item.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-xl flex justify-end space-x-3">
                <button
                  onClick={() => setShowExchangeModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReturnRequest("exchange")}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    availableSizes.length === 0 && availableColors.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  // disabled={
                  //   availableSizes.length === 0 || availableColors.length === 0
                  // }
                >
                  Submit Exchange Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blur Backdrop */}
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={() => setShowConfirmationModal(false)}
            ></div>

            {/* Glass Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Request
              </h3>

              <div className="mb-6">
                <p className="text-gray-700">
                  You are about to submit a {pendingRequestType} request for
                  this item. This action cannot be undone. Are you sure you want
                  to proceed?
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
                  onClick={() => setShowConfirmationModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 ${
                    pendingRequestType === "return"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  } text-white rounded-md hover:${
                    pendingRequestType === "return"
                      ? "bg-red-600"
                      : "bg-blue-600"
                  } transition-colors`}
                  onClick={confirmRequest}
                >
                  Confirm{" "}
                  {pendingRequestType === "return" ? "Return" : "Exchange"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* // Add this modal component in the return section */}
        {showPaymentDetailsModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={() => setShowPaymentDetailsModal(false)}
            ></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Add Payment Details for Refund
                </h3>
                <button
                  onClick={() => setShowPaymentDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`px-4 py-2 rounded-lg ${
                        paymentMethod === "upi"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      onClick={() => setPaymentMethod("bank")}
                      className={`px-4 py-2 rounded-lg ${
                        paymentMethod === "bank"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {paymentMethod === "upi" ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      Example: name@upi, 9876543210@ybl
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={bankDetails.accountNumber}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            accountNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={bankDetails.accountName}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            accountName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={bankDetails.ifscCode}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            ifscCode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankDetails.bankName}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            bankName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                 <button
  onClick={() => {
    if (selectedItem && selectedItem.orderId && selectedItem._id) {
      console.log("Order ID:", selectedItem.orderId);
      console.log("Item ID:", selectedItem._id);

      submitPaymentDetails();
    } else {
      toast.error(
        "Invalid selection. Please select a return item again."
      );
    }
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Submit Details
</button>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
