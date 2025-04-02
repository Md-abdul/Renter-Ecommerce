// import React, { useState, useEffect } from "react";
// import { useCart } from "../../context/CartContext";
// import { format, addDays } from "date-fns";
// import { useNavigate } from "react-router-dom";
// import {
//   FiChevronDown,
//   FiChevronUp,
//   FiTruck,
//   FiCheckCircle,
//   FiClock,
//   FiXCircle,
// } from "react-icons/fi";

// const UserOrders = () => {
//   const { orders, fetchOrders, loading } = useCart();
//   const navigate = useNavigate();
//   const [expandedOrder, setExpandedOrder] = useState(null);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const toggleOrder = (orderId) => {
//     setExpandedOrder(expandedOrder === orderId ? null : orderId);
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "pending":
//         return <FiClock className="text-yellow-500 mr-2" />;
//       case "processing":
//         return <FiClock className="text-blue-500 mr-2" />;
//       case "shipped":
//         return <FiTruck className="text-indigo-500 mr-2" />;
//       case "delivered":
//         return <FiCheckCircle className="text-green-500 mr-2" />;
//       case "cancelled":
//         return <FiXCircle className="text-red-500 mr-2" />;
//       default:
//         return <FiClock className="text-gray-500 mr-2" />;
//     }
//   };

//   const getStatusSteps = (status) => {
//     const steps = [
//       { id: 1, name: "Order Placed", status: "completed" },
//       {
//         id: 2,
//         name: "Processing",
//         status: status === "pending" ? "pending" : "completed",
//       },
//       {
//         id: 3,
//         name: "Shipped",
//         status: ["pending", "processing"].includes(status)
//           ? "pending"
//           : status === "shipped" || status === "delivered"
//           ? "completed"
//           : "pending",
//       },
//       {
//         id: 4,
//         name: "Delivered",
//         status: status === "delivered" ? "completed" : "pending",
//       },
//     ];

//     if (status === "cancelled") {
//       steps.forEach((step) => {
//         if (step.id > 1) step.status = "cancelled";
//       });
//     }

//     return steps;
//   };

//   // Add these functions to the UserOrders component
// const handleReturnRequest = async (orderId, itemId, type, reason, exchangeSize) => {
//   try {
//     const response = await axios.post(
//       `/api/orders/${orderId}/return`,
//       { itemId, type, reason, exchangeSize },
//       { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//     );
//     toast.success("Return/exchange request submitted successfully");
//     fetchOrders(); // Refresh orders
//   } catch (error) {
//     toast.error(error.response?.data?.message || "Failed to submit request");
//   }
// };

// const cancelReturnRequest = async (orderId, itemId) => {
//   try {
//     // You'll need to add a new endpoint for this or reuse the existing one
//     const response = await axios.put(
//       `/api/orders/${orderId}/return/${itemId}`,
//       { status: "cancelled" },
//       { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//     );
//     toast.success("Return request cancelled");
//     fetchOrders();
//   } catch (error) {
//     toast.error(error.response?.data?.message || "Failed to cancel request");
//   }
// };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8 flex justify-center">
//         <div className="animate-pulse text-lg">Loading your orders...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-6xl">
//       <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Orders</h1>

//       {orders.length === 0 ? (
//         <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
//           <div className="max-w-md mx-auto">
//             <img
//               src="https://cdn-icons-png.flaticon.com/512/4555/4555971.png"
//               alt="No orders"
//               className="w-32 h-32 mx-auto mb-6 opacity-80"
//             />
//             <h2 className="text-xl font-semibold mb-2 text-gray-800">
//               No Orders Yet
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Looks like you haven't placed any orders. Start shopping to see
//               your orders here.
//             </p>
//             <button
//               onClick={() => navigate("/")}
//               className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
//             >
//               Start Shopping
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {orders.map((order) => {
//             // Convert createdAt string to Date object
//             const orderDate = new Date(order.createdAt);
//             const updatedDate = order.updatedAt
//               ? new Date(order.updatedAt)
//               : null;
//             const estimatedDeliveryDate = addDays(orderDate, 7);

//             return (
//               <div
//                 key={order._id}
//                 className="border rounded-lg overflow-hidden shadow-sm bg-white"
//               >
//                 <div
//                   className="px-6 py-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
//                   onClick={() => toggleOrder(order._id)}
//                 >
//                   <div className="flex items-center space-x-4">
//                     <div className="bg-gray-100 p-2 rounded-lg">
//                       <FiTruck className="text-gray-500 text-xl" />
//                     </div>
//                     <div>
//                       <div className="flex items-center">
//                         <span className="font-medium text-gray-800">
//                           Order #{order._id.slice(-6).toUpperCase()}
//                         </span>
//                         <span className="ml-3 text-sm text-gray-500">
//                           {format(orderDate, "MMM dd, yyyy")}
//                         </span>
//                       </div>
//                       <div className="flex items-center mt-1">
//                         {getStatusIcon(order.status)}
//                         <span className="text-sm capitalize">
//                           {order.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="font-medium text-gray-800 mr-4">
//                       ₹{order.totalAmount.toFixed(2)}
//                     </span>
//                     {expandedOrder === order._id ? (
//                       <FiChevronUp className="text-gray-500" />
//                     ) : (
//                       <FiChevronDown className="text-gray-500" />
//                     )}
//                   </div>
//                 </div>

//                 {expandedOrder === order._id && (
//                   <div className="p-6">
//                     {/* Order Tracking Timeline */}
//                     <div className="mb-8">
//                       <h3 className="font-medium text-gray-700 mb-4">
//                         Order Status
//                       </h3>
//                       <div className="relative">
//                         <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
//                         {getStatusSteps(order.status).map((step, index) => (
//                           <div key={step.id} className="relative pl-10 pb-6">
//                             <div
//                               className={`absolute left-4 top-0 w-3 h-3 rounded-full -ml-1.5
//                               ${
//                                 step.status === "completed"
//                                   ? "bg-green-500"
//                                   : ""
//                               }
//                               ${step.status === "pending" ? "bg-gray-300" : ""}
//                               ${step.status === "cancelled" ? "bg-red-500" : ""}
//                             `}
//                             ></div>
//                             <div className="flex items-start">
//                               <div className="flex-1">
//                                 <p
//                                   className={`text-sm font-medium
//                                   ${
//                                     step.status === "completed"
//                                       ? "text-green-600"
//                                       : ""
//                                   }
//                                   ${
//                                     step.status === "pending"
//                                       ? "text-gray-500"
//                                       : ""
//                                   }
//                                   ${
//                                     step.status === "cancelled"
//                                       ? "text-red-600"
//                                       : ""
//                                   }
//                                 `}
//                                 >
//                                   {step.name}
//                                 </p>
//                                 {index ===
//                                   getStatusSteps(order.status).length - 1 && (
//                                   <p className="text-xs text-gray-500 mt-1">
//                                     {order.status === "delivered" && updatedDate
//                                       ? `Delivered on ${format(
//                                           updatedDate,
//                                           "MMM dd, yyyy"
//                                         )}`
//                                       : order.status === "cancelled"
//                                       ? "Order was cancelled"
//                                       : `Estimated delivery: ${format(
//                                           estimatedDeliveryDate,
//                                           "MMM dd, yyyy"
//                                         )}`}
//                                   </p>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                         ))}
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <h3 className="font-medium text-gray-700 mb-3">
//                           Shipping Address
//                         </h3>
//                         <div className="text-gray-600 space-y-1">
//                           <p>{order.shippingAddress.name}</p>
//                           <p>{order.shippingAddress.address}</p>
//                           <p>
//                             {order.shippingAddress.city},{" "}
//                             {order.shippingAddress.state} -{" "}
//                             {order.shippingAddress.zipCode}
//                           </p>
//                           <p>Phone: {order.shippingAddress.phone}</p>
//                         </div>
//                       </div>

//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <h3 className="font-medium text-gray-700 mb-3">
//                           Payment Information
//                         </h3>
//                         <div className="text-gray-600 space-y-3">
//                           <div>
//                             <p className="font-medium">Payment Method</p>
//                             <p className="capitalize">{order.paymentMethod}</p>
//                           </div>
//                           <div>
//                             <p className="font-medium">Payment Status</p>
//                             <p className="text-green-600">Paid</p>
//                           </div>
//                           <div>
//                             <p className="font-medium">Total Amount</p>
//                             <p className="text-lg font-semibold">
//                               ₹{order.totalAmount.toFixed(2)}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="font-medium text-gray-700 mb-4">
//                         Order Items
//                       </h3>
//                       <div className="space-y-4">
//                         {order.items.map((item) => (
//                           <div
//                             key={item.productId}
//                             className="flex items-start border-b pb-4"
//                           >
//                             <img
//                               src={item.image}
//                               alt={item.name}
//                               className="w-20 h-20 object-cover rounded mr-4 border"
//                             />
//                             <div className="flex-1">
//                               <h4 className="font-medium text-gray-800 hover:text-yellow-600 transition">
//                                 {item.name}
//                               </h4>
//                               <p className="text-gray-600 text-sm mt-1">
//                                 Qty: {item.quantity}
//                               </p>
//                               <p className="text-gray-600 text-sm">
//                                 Size: {item.size || "Standard"}
//                               </p>
//                             </div>
//                             <div className="text-gray-900 font-medium">
//                               ₹{(item.price * item.quantity).toFixed(2)}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="mt-6 pt-4 border-t flex justify-end">
//                       <button
//                         onClick={() =>
//                           navigate(`/product/${order.items[0].productId}`)
//                         }
//                         className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
//                       >
//                         Buy it again
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-5 w-5 ml-1"
//                           viewBox="0 0 20 20"
//                           fill="currentColor"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       </button>
//                     </div>

//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserOrders;

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

  const handleReturnRequest = async (
    orderId,
    itemId,
    type,
    reason,
    exchangeSize
  ) => {
    try {
      const response = await axios.post(
        `/api/orders/${orderId}/return`,
        { itemId, type, reason, exchangeSize },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Return/exchange request submitted successfully");
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    }
  };

  const cancelReturnRequest = async (orderId, itemId) => {
    try {
      const response = await axios.put(
        `/api/orders/${orderId}/return/${itemId}`,
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
            // Convert createdAt string to Date object
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
                    {/* Order Tracking Timeline */}
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

                    {/* // Replace the return/exchange section with this improved version: */}
                    {order.status === "delivered" && (
                      <div className="mt-6 pt-4 border-t">
                        <h3 className="font-medium text-gray-700 mb-4">
                          Return/Exchange
                        </h3>
                        {order.items.map((item) => {
                          const canReturn =
                            new Date() < new Date(order.returnWindow);

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

                                {item.returnRequest ? (
                                  <div className="mt-2">
                                    <div
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        item.returnRequest.status ===
                                        "requested"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : item.returnRequest.status ===
                                            "approved"
                                          ? "bg-green-100 text-green-800"
                                          : item.returnRequest.status ===
                                            "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
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
                                ) : canReturn ? (
                                  <div className="mt-2 space-y-2">
                                    <button
                                      onClick={() => {
                                        const type = window.confirm(
                                          "Request return for this item? Click OK for return, Cancel for exchange"
                                        );
                                        if (type !== null) {
                                          const reason = prompt(
                                            "Reason for return/exchange:"
                                          );
                                          if (reason) {
                                            let exchangeSize = null;
                                            if (type === false) {
                                              // User clicked Cancel for exchange
                                              exchangeSize = prompt(
                                                "New size for exchange:"
                                              );
                                              if (exchangeSize) {
                                                handleReturnRequest(
                                                  order._id,
                                                  item._id,
                                                  "exchange",
                                                  reason,
                                                  exchangeSize
                                                );
                                              }
                                            } else {
                                              handleReturnRequest(
                                                order._id,
                                                item._id,
                                                "return",
                                                reason,
                                                null
                                              );
                                            }
                                          }
                                        }
                                      }}
                                      className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      Request Return/Exchange
                                    </button>
                                    <p className="text-xs text-gray-500">
                                      Return window closes on{" "}
                                      {format(
                                        new Date(order.returnWindow),
                                        "MMM dd, yyyy"
                                      )}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Return window expired on{" "}
                                    {format(
                                      new Date(order.returnWindow),
                                      "MMM dd, yyyy"
                                    )}
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
        </div>
      )}
    </div>
  );
};

export default UserOrders;
