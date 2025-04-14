import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { format, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

const UserOrders = () => {
  const { orders, fetchOrders, loading } = useCart();
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnType, setReturnType] = useState("return");
  const [returnReason, setReturnReason] = useState("");
  const [exchangeSize, setExchangeSize] = useState("");

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
        return <FiClock className="text-blue-500 mr-2" />;
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

  // In UserOrders.jsx, update the ReturnModal component and handleReturnRequest function:

  const handleReturnRequest = async (
    orderId,
    itemId,
    type,
    reason,
    exchangeSize
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/orders/${orderId}/return`,
        { itemId, type, reason, exchangeSize },
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
      return response.data; // Return the updated order data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
      throw error;
    }
  };

  // Update the ReturnModal component
  const ReturnModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">
          {returnType === "return" ? "Return Item" : "Exchange Item"}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (required)
          </label>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={3}
            placeholder="Please explain why you want to return/exchange this item"
            required
          />
        </div>

        {returnType === "exchange" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Size (required)
            </label>
            <select
              value={exchangeSize}
              onChange={(e) => setExchangeSize(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Select new size</option>
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
              <option value="XL">Extra Large (XL)</option>
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowReturnModal(false);
              setReturnReason("");
              setExchangeSize("");
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!returnReason) {
                toast.error("Please provide a reason");
                return;
              }
              if (returnType === "exchange" && !exchangeSize) {
                toast.error("Please select exchange size");
                return;
              }

              try {
                await handleReturnRequest(
                  selectedItem.orderId,
                  selectedItem.itemId,
                  returnType,
                  returnReason,
                  exchangeSize
                );
                setShowReturnModal(false);
                setReturnReason("");
                setExchangeSize("");
              } catch (error) {
                console.error("Failed to submit request:", error);
              }
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );

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

  // const ReturnModal = () => (
  //   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //     <div className="bg-white rounded-lg p-6 max-w-md w-full">
  //       <h3 className="text-lg font-medium mb-4">
  //         {returnType === "return" ? "Return Item" : "Exchange Item"}
  //       </h3>

  //       <div className="mb-4">
  //         <label className="block text-sm font-medium text-gray-700 mb-1">
  //           Reason
  //         </label>
  //         <textarea
  //           value={returnReason}
  //           onChange={(e) => setReturnReason(e.target.value)}
  //           className="w-full border border-gray-300 rounded-md p-2"
  //           rows={3}
  //           placeholder="Why are you returning/exchanging this item?"
  //         />
  //       </div>

  //       {returnType === "exchange" && (
  //         <div className="mb-4">
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             New Size
  //           </label>
  //           <input
  //             type="text"
  //             value={exchangeSize}
  //             onChange={(e) => setExchangeSize(e.target.value)}
  //             className="w-full border border-gray-300 rounded-md p-2"
  //             placeholder="Enter the size you want to exchange to"
  //           />
  //         </div>
  //       )}

  //       <div className="flex justify-end space-x-3">
  //         <button
  //           onClick={() => setShowReturnModal(false)}
  //           className="px-4 py-2 border border-gray-300 rounded-md"
  //         >
  //           Cancel
  //         </button>
  //         <button
  //           onClick={async () => {
  //             if (!returnReason) {
  //               toast.error("Please provide a reason");
  //               return;
  //             }
  //             if (returnType === "exchange" && !exchangeSize) {
  //               toast.error("Please provide exchange size");
  //               return;
  //             }

  //             try {
  //               await handleReturnRequest(
  //                 selectedItem.orderId,
  //                 selectedItem.itemId,
  //                 returnType,
  //                 returnReason,
  //                 exchangeSize
  //               );
  //               setShowReturnModal(false);
  //               setReturnReason("");
  //               setExchangeSize("");
  //             } catch (error) {
  //               toast.error("Failed to submit request");
  //             }
  //           }}
  //           className="px-4 py-2 bg-yellow-600 text-white rounded-md"
  //         >
  //           Submit Request
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );

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
                            </div>
                            <div className="text-gray-900 font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.status === "delivered" && order.canReturn && (
                      <div className="mt-6 pt-4 border-t">
                        <h3 className="font-medium text-gray-700 mb-4">
                          Return/Exchange
                        </h3>
                        {order.items.map((item) => {
                          // Use the returnWindow from the order if available
                          const returnDeadline = order.returnWindow
                            ? new Date(order.returnWindow)
                            : new Date(
                                new Date(order.updatedAt).getTime() +
                                  7 * 24 * 60 * 60 * 1000
                              );

                          const canReturn = new Date() < returnDeadline;
                          const daysLeft = canReturn
                            ? Math.ceil(
                                (returnDeadline - new Date()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0;

                          return (
                            <div
                              key={item._id}
                              className="flex items-start border-b pb-4 mb-4"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded mr-4 border"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">
                                  {item.name}
                                </h4>
                                <p className="text-gray-600 text-sm">
                                  Qty: {item.quantity}
                                </p>
                                {item.size && (
                                  <p className="text-gray-600 text-sm">
                                    Size: {item.size}
                                  </p>
                                )}

                                {!item.returnRequest && canReturn && (
                                  <div className="mt-3">
                                    <div className="flex space-x-3">
                                      <button
                                        onClick={() => {
                                          setSelectedItem({
                                            orderId: order._id,
                                            itemId: item._id,
                                          });
                                          setReturnType("return");
                                          setShowReturnModal(true);
                                        }}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100"
                                      >
                                        Return Item
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedItem({
                                            orderId: order._id,
                                            itemId: item._id,
                                          });
                                          setReturnType("exchange");
                                          setShowReturnModal(true);
                                        }}
                                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                                      >
                                        Exchange Item
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {daysLeft > 1
                                        ? `${daysLeft} days left to return`
                                        : "Last day to return"}
                                    </p>
                                  </div>
                                )}

                                {item.returnRequest && (
                                  <div className="mt-2">
                                    <div
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        item.returnRequest.status ===
                                        "requested"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : item.returnRequest.status ===
                                            "approved"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {item.returnRequest.type}{" "}
                                      {item.returnRequest.status}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Reason: {item.returnRequest.reason}
                                    </p>
                                    {item.returnRequest.exchangeSize && (
                                      <p className="text-sm text-gray-600">
                                        Exchange size:{" "}
                                        {item.returnRequest.exchangeSize}
                                      </p>
                                    )}
                                    <div className="mt-3">
                                      <h5 className="text-sm font-medium text-gray-700">
                                        Return Status
                                      </h5>
                                      <div className="flex items-center mt-1 space-x-4">
                                        <div
                                          className={`flex items-center ${
                                            item.returnRequest.status !==
                                            "requested"
                                              ? "text-green-500"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          <FiCheckCircle className="mr-1" />
                                          <span className="text-xs">
                                            Requested
                                          </span>
                                        </div>
                                        <div
                                          className={`flex items-center ${
                                            item.returnRequest.status ===
                                            "approved"
                                              ? "text-green-500"
                                              : item.returnRequest.status ===
                                                "rejected"
                                              ? "text-red-500"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          <FiCheckCircle className="mr-1" />
                                          <span className="text-xs">
                                            {item.returnRequest.status ===
                                            "rejected"
                                              ? "Rejected"
                                              : "Reviewed"}
                                          </span>
                                        </div>
                                        <div
                                          className={`flex items-center ${
                                            item.returnRequest.status ===
                                            "completed"
                                              ? "text-green-500"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          <FiCheckCircle className="mr-1" />
                                          <span className="text-xs">
                                            Completed
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {item.returnRequest.status ===
                                      "requested" && (
                                      <button
                                        onClick={() =>
                                          cancelReturnRequest(
                                            order._id,
                                            item._id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-800 text-sm mt-2"
                                      >
                                        Cancel Request
                                      </button>
                                    )}
                                  </div>
                                )}

                                {!item.returnRequest && !canReturn && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Return window expired on{" "}
                                    {format(returnDeadline, "MMM dd, yyyy")}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t flex justify-end">
                      <button
                        onClick={() =>
                          navigate(`/product/${order.items[0].productId}`)
                        }
                        className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
                      >
                        Buy it again
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {showReturnModal && <ReturnModal />}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
