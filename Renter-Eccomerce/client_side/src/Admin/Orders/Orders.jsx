// import React, { useState, useEffect } from "react";
// import {
//   FiTruck,
//   FiCheckCircle,
//   FiClock,
//   FiXCircle,
//   FiRefreshCw,
// } from "react-icons/fi";
// import { format } from "date-fns";
// import axios from "axios";
// import { toast } from "react-toastify";

// export const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [error, setError] = useState(null);
//   const [returnRequests, setReturnRequests] = useState([]);
//   const [showReturns, setShowReturns] = useState(false);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem("adminToken");
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(
//         "http://localhost:5000/api/orders/admin",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const ordersData = Array.isArray(response.data) ? response.data : [];
//       setOrders(ordersData);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       setError(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to fetch orders"
//       );
//       setLoading(false);
//       setOrders([]);
//     }
//   };

//   const fetchReturnRequests = async () => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       const response = await axios.get(
//         "http://localhost:5000/api/orders/returns",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setReturnRequests(response.data);
//     } catch (error) {
//       console.error("Error fetching return requests:", error);
//       toast.error("Failed to fetch return requests");
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       await axios.put(
//         `http://localhost:5000/api/orders/${orderId}/status`,
//         { status: newStatus },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       toast.success("Order status updated successfully");
//       fetchOrders();
//     } catch (error) {
//       console.error("Error updating order status:", error);
//       toast.error(
//         error.response?.data?.message || "Failed to update order status"
//       );
//     }
//   };

//   const updateReturnStatus = async (orderId, itemId, newStatus) => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       await axios.put(
//         `http://localhost:5000/api/orders/${orderId}/return/${itemId}`,
//         { status: newStatus },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success(`Return request ${newStatus}`);
//       fetchReturnRequests();
//     } catch (error) {
//       console.error("Error updating return status:", error);
//       toast.error(
//         error.response?.data?.message || "Failed to update return status"
//       );
//     }
//   };

//   const filteredOrders = orders.filter((order) => {
//     if (!order || typeof order !== "object") return false;

//     const matchesStatus =
//       statusFilter === "all" || order.status === statusFilter;
//     const matchesSearch =
//       (order._id && order._id.includes(searchTerm)) ||
//       order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesStatus && matchesSearch;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "processing":
//         return "bg-blue-100 text-blue-800";
//       case "shipped":
//         return "bg-purple-100 text-purple-800";
//       case "delivered":
//         return "bg-green-100 text-green-800";
//       case "cancelled":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "pending":
//         return <FiClock className="inline-block mr-1" />;
//       case "processing":
//         return <FiRefreshCw className="inline-block mr-1" />;
//       case "shipped":
//         return <FiTruck className="inline-block mr-1" />;
//       case "delivered":
//         return <FiCheckCircle className="inline-block mr-1" />;
//       case "cancelled":
//         return <FiXCircle className="inline-block mr-1" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
//         <div className="flex space-x-4">
//           <div className="relative">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="all">All Statuses</option>
//               <option value="pending">Pending</option>
//               <option value="processing">Processing</option>
//               <option value="shipped">Shipped</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//           <input
//             type="text"
//             placeholder="Search orders..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           />
//           <button
//             onClick={() => {
//               setShowReturns(!showReturns);
//               if (!showReturns) fetchReturnRequests();
//             }}
//             className={`px-4 py-2 rounded-md ${
//               showReturns
//                 ? "bg-gray-200 text-gray-800"
//                 : "bg-blue-500 text-white"
//             } hover:bg-blue-600 transition-colors`}
//           >
//             {showReturns ? "Hide Returns" : "View Returns"}
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <svg
//                 className="h-5 w-5 text-red-500"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {showReturns ? (
//         <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
//           <h2 className="text-xl font-semibold p-4 border-b">
//             Return/Exchange Requests
//           </h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Order ID
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Customer
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Product
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Type
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Reason
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {returnRequests.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="7"
//                       className="px-6 py-4 text-center text-gray-500"
//                     >
//                       No return requests found
//                     </td>
//                   </tr>
//                 ) : (
//                   returnRequests.map((request) => (
//                     <tr key={`${request.orderId}-${request.itemId}`}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {request.orderNumber ||
//                           request.orderId?.substring(0, 8)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {request.customer || request.userId?.name}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {request.email || request.userId?.email}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {request.productName}
//                         {request.exchangeSize && (
//                           <div className="text-xs text-gray-500">
//                             Exchange to: {request.exchangeSize}
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
//                         {request.type}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {request.reason}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             request.status === "requested"
//                               ? "bg-yellow-100 text-yellow-800"
//                               : request.status === "approved"
//                               ? "bg-green-100 text-green-800"
//                               : "bg-red-100 text-red-800"
//                           }`}
//                         >
//                           {request.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         {request.status === "requested" && (
//                           <div className="space-x-2">
//                             <button
//                               onClick={() => {
//                                 updateReturnStatus(
//                                   request.orderId,
//                                   request.itemId,
//                                   "approved"
//                                 );
//                               }}
//                               className="text-green-600 hover:text-green-900"
//                             >
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => {
//                                 updateReturnStatus(
//                                   request.orderId,
//                                   request.itemId,
//                                   "rejected"
//                                 );
//                               }}
//                               className="text-red-600 hover:text-red-900"
//                             >
//                               Reject
//                             </button>
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <>
//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Order ID
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Customer
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Items
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Total
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredOrders.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan="7"
//                           className="px-6 py-4 text-center text-gray-500"
//                         >
//                           {orders.length === 0
//                             ? "No orders found"
//                             : "No orders match your filters"}
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredOrders.map((order) => (
//                         <tr key={order._id}>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {order._id.substring(0, 8)}...
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm text-gray-900">
//                               {order.userId?.name}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               {order.userId?.email}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {format(new Date(order.createdAt), "MMM dd, yyyy")}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {order.items.reduce(
//                               (sum, item) => sum + item.quantity,
//                               0
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             ${order.totalAmount.toFixed(2)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
//                                 order.status
//                               )}`}
//                             >
//                               {getStatusIcon(order.status)}{" "}
//                               {order.status.charAt(0).toUpperCase() +
//                                 order.status.slice(1)}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <select
//                               value={order.status}
//                               onChange={(e) =>
//                                 updateOrderStatus(order._id, e.target.value)
//                               }
//                               className={`border rounded px-2 py-1 text-sm ${getStatusColor(
//                                 order.status
//                               )}`}
//                             >
//                               <option value="pending">Pending</option>
//                               <option value="processing">Processing</option>
//                               <option value="shipped">Shipped</option>
//                               <option value="delivered">Delivered</option>
//                               <option value="cancelled">Cancelled</option>
//                             </select>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };




import React, { useState, useEffect } from "react";
import {
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiUser,
  FiPackage,
  FiCalendar,
} from "react-icons/fi";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [returnRequests, setReturnRequests] = useState([]);
  const [showReturns, setShowReturns] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        "http://localhost:5000/api/orders/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders"
      );
      setLoading(false);
      setOrders([]);
    }
  };

  const fetchReturnRequests = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "http://localhost:5000/api/orders/returns",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReturnRequests(response.data);
    } catch (error) {
      console.error("Error fetching return requests:", error);
      toast.error("Failed to fetch return requests");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  };

  const updateReturnStatus = async (orderId, itemId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/return/${itemId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Return request ${newStatus}`);
      fetchReturnRequests();
    } catch (error) {
      console.error("Error updating return status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update return status"
      );
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!order || typeof order !== "object") return false;

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      (order._id && order._id.includes(searchTerm)) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="inline-block mr-1" />;
      case "processing":
        return <FiRefreshCw className="inline-block mr-1" />;
      case "shipped":
        return <FiTruck className="inline-block mr-1" />;
      case "delivered":
        return <FiCheckCircle className="inline-block mr-1" />;
      case "cancelled":
        return <FiXCircle className="inline-block mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">
            {showReturns ? "Viewing return requests" : "Viewing all orders"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 w-full"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              setShowReturns(!showReturns);
              if (!showReturns) fetchReturnRequests();
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              showReturns
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-yellow-500 text-gray-900 hover:bg-yellow-600"
            }`}
          >
            {showReturns ? "Hide Returns" : "View Returns"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiXCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showReturns ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiRefreshCw className="mr-2" />
              Return/Exchange Requests
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FiPackage className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                          No return requests found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          When customers request returns, they'll appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  returnRequests.map((request) => (
                    <tr key={`${request.orderId}-${request.itemId}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.orderNumber ||
                          request.orderId?.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.customer || request.userId?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.email || request.userId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.productName}
                        </div>
                        {request.exchangeSize && (
                          <div className="text-xs text-gray-500">
                            Exchange to: {request.exchangeSize}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {request.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === "requested"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === "requested" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                updateReturnStatus(
                                  request.orderId,
                                  request.itemId,
                                  "approved"
                                );
                              }}
                              className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                updateReturnStatus(
                                  request.orderId,
                                  request.itemId,
                                  "rejected"
                                );
                              }}
                              className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2" />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiPackage className="mr-2" />
                          Items
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiDollarSign className="mr-2" />
                          Total
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <FiPackage className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">
                              {orders.length === 0
                                ? "No orders found"
                                : "No orders match your filters"}
                            </h3>
                            {statusFilter !== "all" && (
                              <button
                                onClick={() => setStatusFilter("all")}
                                className="mt-4 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors"
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order._id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiUser className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {order.userId?.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.userId?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}{" "}
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                              className={`border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${getStatusColor(
                                order.status
                              )}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
