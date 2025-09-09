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
  FiEdit,
  FiSave,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiShoppingBag,
  FiCreditCard,
  FiMapPin,
  FiBox,
} from "react-icons/fi";
import { format, parse, isValid } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [returnRequests, setReturnRequests] = useState([]);
  const [showReturns, setShowReturns] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [viewingBankDetails, setViewingBankDetails] = useState(null);

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
        "https://renter-ecommerce.vercel.app/api/orders/admin",
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
      // console.error("Error fetching orders:", error);
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
        "https://renter-ecommerce.vercel.app/api/orders/returns",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter out any invalid requests and ensure all required fields exist
      const validRequests = response.data.filter(
        (request) =>
          request.orderNumber &&
          request.itemId &&
          request.type &&
          request.status &&
          !isNaN(request.price) &&
          !isNaN(request.quantity)
      );

      setReturnRequests(validRequests);
    } catch (error) {
      // console.error("Error fetching return requests:", error);
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
        `https://renter-ecommerce.vercel.app/api/orders/${orderId}/status`,
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
      // console.error("Error updating order status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  };

  const updateReturnStatus = async (orderId, itemId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `https://renter-ecommerce.vercel.app/api/orders/${orderId}/return/${itemId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Return request ${newStatus}`);
      fetchReturnRequests();
      fetchOrders();
    } catch (error) {
      console.error("Error updating return status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update return status"
      );
    }
  };

  const updateTrackingNumber = async (orderId, itemId) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `https://renter-ecommerce.vercel.app/api/orders/${orderId}/return/${itemId}/tracking`,
        { trackingNumber: trackingInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Tracking number updated");
      setEditingTracking(null);
      setTrackingInput("");
      fetchReturnRequests();
    } catch (error) {
      toast.error("Failed to update tracking number");
      console.error(error);
    }
  };

  const startEditingTracking = (request) => {
    setEditingTracking(`${request.orderId}-${request.itemId}`);
    setTrackingInput(request.trackingNumber || "");
  };

  const cancelEditingTracking = () => {
    setEditingTracking(null);
    setTrackingInput("");
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const generateInvoice = async (order) => {
    try {
      // Create a temporary div to render the invoice content
      const invoiceElement = document.createElement("div");
      invoiceElement.style.position = "absolute";
      invoiceElement.style.left = "-9999px";
      invoiceElement.style.width = "800px";
      invoiceElement.style.padding = "20px";
      invoiceElement.style.backgroundColor = "white";

      // Populate the invoice content
      invoiceElement.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="text-align: center; color: #333; margin-bottom: 30px;">INVOICE</h1>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="flex: 1;">
              <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;">From</h3>
              <p><strong>Ranter Store</strong></p>
              <p>shop 10 Ground Floor Ghansoli</p>
              <p>Howrah Chowk sector 3 Ambika</p>
              <p>Darshan SocietyThane, Maharashtra,</p>
              <p>400701, India</p>
            </div>
            
            <div style="flex: 1; text-align: right;">
              <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;">Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${order._id.substring(0, 8)}</p>
              <p><strong>Date:</strong> ${new Date(
                order.createdAt
              ).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${
                order.status.charAt(0).toUpperCase() + order.status.slice(1)
              }</p>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="flex: 1;">
              <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;">Bill To</h3>
              <p><strong>${order.userId?.name || "N/A"}</strong></p>
              <p>${
                order.shippingAddress?.email || order.userId?.email || "N/A"
              }</p>
              <p>${order.shippingAddress?.phoneNumber || "N/A"}</p>
            </div>
            
            <div style="flex: 1; text-align: right;">
              <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;">Ship To</h3>
              <p>${
                order.shippingAddress?.street ||
                order.shippingAddress?.address?.street ||
                "N/A"
              }</p>
              <p>${
                order.shippingAddress?.city ||
                order.shippingAddress?.address?.city ||
                "N/A"
              }, 
                 ${
                   order.shippingAddress?.state ||
                   order.shippingAddress?.address?.state ||
                   "N/A"
                 }</p>
              <p>${
                order.shippingAddress?.zipCode ||
                order.shippingAddress?.address?.zipCode ||
                "N/A"
              }</p>
            </div>
          </div>
          
          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; vertical-align: top;">
                    <strong>${item.name}</strong>
                    ${
                      item.color
                        ? `<div style="font-size: 0.9em;">Color: ${item.color}</div>`
                        : ""
                    }
                    ${
                      item.size
                        ? `<div style="font-size: 0.9em;">Size: ${item.size}</div>`
                        : ""
                    }
                  </td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right; vertical-align: top;">₹${item.price.toFixed(
                    2
                  )}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center; vertical-align: top;">${
                    item.quantity
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right; vertical-align: top;">₹${(
                    item.price * item.quantity
                  ).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div style="float: right; width: 300px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;"><strong>Subtotal:</strong></td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">₹${order.items
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2)}</td>
    </tr>
    ${
      order.appliedCoupon
        ? `
      <tr>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;"><strong>Coupon (${
          order.appliedCoupon.couponCode
        }):</strong></td>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">-₹${order.appliedCoupon.discountAmount.toFixed(
          2
        )}</td>
      </tr>
      <tr>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;"><strong>Discount (${
          order.appliedCoupon.discountPercentage
        }%):</strong></td>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">-₹${order.appliedCoupon.discountAmount.toFixed(
          2
        )}</td>
      </tr>
    `
        : ""
    }
    <tr>
      <td style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
      <td style="padding: 8px; text-align: right;"><strong>₹${
        order.totalAmount?.toFixed(2) || "0.00"
      }</strong></td>
    </tr>
  </table>
</div>
          
          <div style="clear: both; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 0.9em; color: #777;">
            <p>Thank you for your business!</p>
            <p>Ranter store | info.ranter@gmail.com | 9029297732</p>
          </div>
        </div>
      `;

      document.body.appendChild(invoiceElement);

      // Convert the HTML to canvas then to PDF
      const canvas = await html2canvas(invoiceElement);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      document.body.removeChild(invoiceElement);

      // Save the PDF
      pdf.save(`invoice_${order._id.substring(0, 8)}.pdf`);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      // console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
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

  // Update the getReturnStatusOptions function:
  const getReturnStatusOptions = (currentStatus, requestType) => {
    // Status flow for returns
    const returnStatusFlow = {
      requested: ["approved", "rejected"],
      approved: ["processing", "pickuped", "refund_completed", "rejected"],
      processing: ["processing", "pickuped", "refund_completed", "rejected"],
      pickuped: ["processing", "refund_completed", "rejected"],
      refund_completed: ["completed"],
      rejected: [],
      cancelled: [],
      completed: [],
    };

    // Status flow for exchanges
    const exchangeStatusFlow = {
      requested: ["approved", "rejected"],
      approved: ["processing", "shipped", "delivered", "rejected"],
      processing: ["processing", "shipped", "delivered", "rejected"],
      shipped: ["processing", "shipped", "delivered", "rejected"],
      delivered: ["completed"],
      rejected: [],
      cancelled: [],
      completed: [],
    };

    return requestType === "return"
      ? returnStatusFlow[currentStatus] || []
      : exchangeStatusFlow[currentStatus] || [];
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy, hh:mm a");
  };

  // Helper function to get address fields safely
  const getAddressField = (shippingAddress, field) => {
    if (
      shippingAddress[field] !== undefined &&
      shippingAddress[field] !== null
    ) {
      return shippingAddress[field];
    }
    if (
      shippingAddress.address &&
      shippingAddress.address[field] !== undefined &&
      shippingAddress.address[field] !== null
    ) {
      return shippingAddress.address[field];
    }
    return "N/A";
  };

  const BankDetailsModal = ({ request, onClose }) => {
    if (!request.paymentDetails) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <FiCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No payment details provided yet</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Refund Payment Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {request.paymentDetails?.upiId &&
            (!request.paymentDetails.bankAccount ||
              Object.keys(request.paymentDetails.bankAccount).length === 0) ? (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <FiCreditCard className="mr-2" />
                  UPI Details
                </h4>
                <div className="bg-white p-3 rounded border border-blue-100">
                  <p className="font-mono text-blue-900 break-all">
                    {request.paymentDetails.upiId}
                  </p>
                </div>
              </div>
            ) : request.paymentDetails?.bankAccount &&
              Object.keys(request.paymentDetails.bankAccount).length > 0 &&
              !request.paymentDetails?.upiId ? (
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                  <FiCreditCard className="mr-2" />
                  Bank Account Details
                </h4>
                <div className="bg-white p-3 rounded border border-green-100 space-y-2">
                  {request.paymentDetails.bankAccount.accountName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">
                        {request.paymentDetails.bankAccount.accountName}
                      </span>
                    </div>
                  )}
                  {request.paymentDetails.bankAccount.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-mono">
                        {request.paymentDetails.bankAccount.accountNumber}
                      </span>
                    </div>
                  )}
                  {request.paymentDetails.bankAccount.bankName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium">
                        {request.paymentDetails.bankAccount.bankName}
                      </span>
                    </div>
                  )}
                  {request.paymentDetails.bankAccount.ifscCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-mono">
                        {request.paymentDetails.bankAccount.ifscCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-md text-sm text-gray-600 italic border border-yellow-100">
                <FiCreditCard className="inline mr-2" />
                No payment details available
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleViewBankDetails = (request) => {
    setViewingBankDetails(request);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {viewingBankDetails && (
        <BankDetailsModal
          request={viewingBankDetails}
          onClose={() => setViewingBankDetails(null)}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders Management
          </h1>
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
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiRefreshCw className="mr-2 text-blue-600" />
              Return & Exchange Requests
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage customer return and exchange requests
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
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
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiPackage className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                          No return requests found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          When customers request returns or exchanges, they'll
                          appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  returnRequests.map((request) => {
                    const requestKey = `${request.orderId}-${request.itemId}`;
                    const isEditing = editingTracking === requestKey;
                    const statusColor = {
                      requested: "bg-yellow-100 text-yellow-800",
                      approved: "bg-blue-100 text-blue-800",
                      processing: "bg-indigo-100 text-indigo-800",
                      shipped: "bg-purple-100 text-purple-800",
                      delivered: "bg-green-100 text-green-800",
                      completed: "bg-green-200 text-green-900",
                      rejected: "bg-red-100 text-red-800",
                      cancelled: "bg-red-100 text-red-800",
                    };
                    // order === splice  => RE / Ex order === Re
                    return (
                      <tr key={requestKey} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-blue-50 p-2 rounded-lg mr-3">
                              <FiShoppingBag className="text-blue-600 h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {/* Order #{request.orderNumber} */}
                                <span className="font-medium text-sm text-gray-700">
                                  Order ID:{" "}
                                  {request.type === "return"
                                    ? `RE#${request.orderNumber}`
                                    : request.type === "exchange"
                                    ? `EX#${request.orderNumber}`
                                    : `#${request.orderNumber}`}
                                </span>
                              </div>

                              <div className="text-xs text-gray-500 mt-1">
                                Customer: {request.user.name}
                              </div>
                              {request.type === "return" && (
                                <button
                                  onClick={() => handleViewBankDetails(request)}
                                  className={`px-3 py-1 rounded-md text-sm flex items-center mt-2 ${
                                    request.paymentDetails
                                      ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
                                      : "bg-gray-50 text-gray-500 cursor-not-allowed"
                                  }`}
                                  disabled={!request.paymentDetails}
                                  title={
                                    request.paymentDetails
                                      ? "View bank details for refund"
                                      : "No bank details provided"
                                  }
                                >
                                  <FiCreditCard className="mr-1" />
                                  View Bank Details
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={request.image || "/default-product.png"}
                              alt={request.productName}
                              className="w-12 h-12 rounded-md object-cover mr-3 border border-gray-200"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {request.productName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Qty: {request.quantity} • ₹{request.price}
                              </div>
                            </div>
                          </div>
                          {["approved", "delivered", "completed"].includes(
                            request.status
                          ) &&
                            (request.type === "exchange" ||
                              request.type === "return") &&
                            ["exchange", "return"].includes(request.type) && (
                              <button
                                onClick={async () => {
                                  try {
                                    const token =
                                      localStorage.getItem("adminToken");
                                    await axios.post(
                                      `https://renter-ecommerce.vercel.app/api/orders/${request.orderId}/copy/${request.itemId}`,
                                      // `http://localhost:5000/api/orders/${request.orderId}/copy/${request.itemId}`,
                                      {},
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    );
                                    toast.success("Copy order created!");
                                    fetchOrders(); // Refresh
                                  } catch (err) {
                                    toast.error("Failed to create copy order");
                                  }
                                }}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 transform  mt-3"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                Copy Order
                              </button>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <span className="inline-block bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                {request?.type?.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-700">
                                {request.reason}
                              </span>
                            </div>

                            {request.type === "return" && (
                              <div className="bg-blue-50 p-2 rounded-md">
                                <div className="text-xs font-medium text-blue-800 mb-1">
                                  Return Preferences:
                                </div>
                                <div className="text-xs text-blue-700">
                                  {/* {request.exchangeSize && ( */}
                                  <div>
                                    • Product Quntity:{" "}
                                    {request.requestedQuantity}
                                  </div>
                                  {/* )} */}
                                </div>
                              </div>
                            )}

                            {request.type === "exchange" && (
                              <div className="bg-blue-50 p-2 rounded-md">
                                <div className="text-xs font-medium text-blue-800 mb-1">
                                  Exchange Preferences:
                                </div>
                                <div className="text-xs text-blue-700">
                                  {request.exchangeColor && (
                                    <div>• Color: {request.exchangeColor}</div>
                                  )}
                                  {request.exchangeSize && (
                                    <div>• Size: {request.exchangeSize}</div>
                                  )}
                                  {request.exchangeSize && (
                                    <div>
                                      • Product Quntity:{" "}
                                      {request.requestedQuantity}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {request.trackingNumber && !isEditing && (
                              <div className="flex items-center text-sm text-gray-600 mt-2">
                                <FiTruck className="mr-1 text-gray-500" />
                                <span>Tracking: {request.trackingNumber}</span>
                              </div>
                            )}

                            {isEditing && (
                              <div className="mt-2 flex items-center">
                                <input
                                  type="text"
                                  value={trackingInput}
                                  onChange={(e) =>
                                    setTrackingInput(e.target.value)
                                  }
                                  placeholder="Enter tracking number"
                                  className="border rounded px-2 py-1 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  onClick={() =>
                                    updateTrackingNumber(
                                      request.orderId,
                                      request.itemId
                                    )
                                  }
                                  className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                  title="Save"
                                >
                                  <FiSave />
                                </button>
                                <button
                                  onClick={cancelEditingTracking}
                                  className="ml-1 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Cancel"
                                >
                                  <FiX />
                                </button>
                              </div>
                            )}

                            {/* {["approved", "delivered", "completed"].includes(
                              request.status
                            ) &&
                              request.type === "exchange" && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const token =
                                        localStorage.getItem("adminToken");
                                      await axios.post(
                                        `https://renter-ecommerce.vercel.app/api/orders/${request.orderId}/copy/${request.itemId}`,
                                        {},
                                        {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        }
                                      );
                                      toast.success("Copy order created!");
                                      fetchOrders(); // Refresh
                                    } catch (err) {
                                      toast.error(
                                        "Failed to create copy order"
                                      );
                                    }
                                  }}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                                >
                                  Copy Order
                                </button>
                              )} */}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                statusColor[request.status]
                              }`}
                            >
                              {request.status?.charAt(0).toUpperCase() +
                                request.status?.slice(1)}
                            </span>
                            {/* <span className="text-xs text-gray-500 mt-1">
                              {formatDate(request.updatedAt)}
                            </span> */}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {request.status === "requested" && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() =>
                                  updateReturnStatus(
                                    request.orderId,
                                    request.itemId,
                                    "approved"
                                  )
                                }
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm flex items-center"
                              >
                                <FiCheckCircle className="mr-1" /> Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateReturnStatus(
                                    request.orderId,
                                    request.itemId,
                                    "rejected"
                                  )
                                }
                                className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm flex items-center"
                              >
                                <FiXCircle className="mr-1" /> Reject
                              </button>
                            </div>
                          )}

                          {[
                            "approved",
                            "processing",
                            "shipped",
                            "pickuped",
                          ].includes(request.status) && (
                            <div className="flex flex-col gap-2">
                              <select
                                value={request.status}
                                onChange={(e) =>
                                  updateReturnStatus(
                                    request.orderId,
                                    request.itemId,
                                    e.target.value
                                  )
                                }
                                className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {getReturnStatusOptions(
                                  request.status,
                                  request.type
                                ).map((option) => (
                                  <option key={option} value={option}>
                                    {option
                                      .split("_")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")}
                                  </option>
                                ))}
                              </select>
                              {["shipped", "delivered"].includes(
                                request.status
                              ) &&
                                !isEditing && (
                                  <button
                                    onClick={() =>
                                      startEditingTracking(request)
                                    }
                                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded flex items-center text-xs"
                                  >
                                    <FiEdit className="mr-1" /> Edit Tracking
                                  </button>
                                )}
                            </div>
                          )}

                          {request.status === "delivered" && (
                            <button
                              onClick={() =>
                                updateReturnStatus(
                                  request.orderId,
                                  request.itemId,
                                  "completed"
                                )
                              }
                              className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm flex items-center"
                            >
                              <FiCheckCircle className="mr-1" /> Complete
                            </button>
                          )}

                          {request.status === "rejected" && (
                            <div className="text-xs text-gray-500 italic">
                              Request rejected
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-200"
                  >
                    <div
                      className="p-6 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                      onClick={() => toggleOrderExpansion(order._id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-yellow-100 p-3 rounded-lg">
                          <FiShoppingBag className="text-yellow-600 h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Order Number :- {order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            items • ₹{Math.floor(order.totalAmount.toFixed(2))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}{" "}
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-gray-400">
                          {expandedOrder === order._id ? (
                            <FiChevronUp className="h-5 w-5" />
                          ) : (
                            <FiChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="border-t border-gray-200 px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <FiPackage className="mr-2" />
                              Order Items
                            </h4>
                            <div className="space-y-4">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg"
                                >
                                  <img
                                    src={item.image || "/default-product.png"}
                                    alt={item.name}
                                    className="w-16 h-16 rounded-md object-cover"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">
                                      {item.name}
                                    </h5>
                                    <div className="text-sm text-gray-500 mt-1">
                                      {item.color && <p>Color: {item.color}</p>}
                                      {item.size && <p>Size: {item.size}</p>}
                                      <p>Qty: {item.quantity}</p>
                                      <p>Price: ₹{Math.floor(item.price)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Customer Details */}
                            <h4 className="font-semibold text-gray-900 mt-6 mb-3 flex items-center">
                              <FiUser className="mr-2" />
                              Customer Details
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <p className="font-medium">
                                {order.userId?.name}
                              </p>
                              <p className="text-gray-600">
                                {order.userId?.email}
                              </p>
                              <p className="text-gray-600">
                                Phone No: {order.shippingAddress?.phoneNumber}
                              </p>
                              <p className="text-gray-600">
                                Payment Method: {order?.paymentMethod}
                              </p>
                              <p className="text-gray-600">
                                Status: {order?.status}
                              </p>
                            </div>
                          </div>

                          {/* Order Details */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <FiShoppingBag className="mr-2" />
                              Order Details
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">
                                  ₹
                                  {Math.floor(
                                    order.items
                                      .reduce(
                                        (sum, item) =>
                                          sum + item.price * item.quantity,
                                        0
                                      )
                                      .toFixed(2)
                                  )}
                                </span>
                              </div>

                              {/* Add Coupon Information here */}
                              {order.appliedCoupon && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Coupon Applied:
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {order.appliedCoupon.couponCode}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Discount (
                                      {order.appliedCoupon.discountPercentage}
                                      %):
                                    </span>
                                    <span className="font-medium text-green-600">
                                      -₹
                                      {Math.floor(
                                        order.appliedCoupon.discountAmount.toFixed(
                                          2
                                        )
                                      )}
                                    </span>
                                  </div>
                                </>
                              )}

                              <div className="flex justify-between border-t border-gray-200 pt-2">
                                <span className="text-gray-900 font-semibold">
                                  Total:
                                </span>
                                <span className="font-bold text-gray-900">
                                  ₹
                                  {Math.floor(
                                    order.totalAmount?.toFixed(2) || "0.00"
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            {/* <h4 className="font-semibold text-gray-900 mt-6 mb-3 flex items-center">
                              <FiMapPin className="mr-2" />
                              Shipping Address
                            </h4> */}
                            <h4 className="font-semibold text-gray-900 mt-6 mb-3 flex items-center">
                              <FiMapPin className="mr-2" />
                              {order.orderNumber?.includes("RE") ||
                              order.orderNumber?.includes("EX")
                                ? "Pickup Address"
                                : "Shipping Address"}
                            </h4>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                              {order?.shippingAddress ? (
                                <>
                                  <p className="font-medium">
                                    {order.shippingAddress.name || "N/A"}
                                  </p>
                                  <p>
                                    {getAddressField(
                                      order.shippingAddress,
                                      "street"
                                    )}
                                  </p>
                                  <p>
                                    {getAddressField(
                                      order.shippingAddress,
                                      "city"
                                    )}
                                    {getAddressField(
                                      order.shippingAddress,
                                      "state"
                                    ) &&
                                      getAddressField(
                                        order.shippingAddress,
                                        "state"
                                      ) !== "N/A" &&
                                      `, ${getAddressField(
                                        order.shippingAddress,
                                        "state"
                                      )}`}
                                    {getAddressField(
                                      order.shippingAddress,
                                      "zipCode"
                                    ) &&
                                      getAddressField(
                                        order.shippingAddress,
                                        "zipCode"
                                      ) !== "N/A" &&
                                      ` - ${getAddressField(
                                        order.shippingAddress,
                                        "zipCode"
                                      )}`}
                                  </p>
                                  <p>
                                    Phone:{" "}
                                    {order.shippingAddress.phoneNumber || "N/A"}
                                  </p>
                                  {order.shippingAddress.alternatePhone && (
                                    <p>
                                      Alternate Phone:{" "}
                                      {order.shippingAddress.alternatePhone}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-red-500">
                                  No shipping address available
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                          <div className="mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Update Status
                            </label>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                              className={`border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${getStatusColor(
                                order.status
                              )}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="flex space-x-3">
                            {/* <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                              <FiBox className="inline mr-2" />
                              View Packaging Slip
                            </button> */}
                            <button
                              onClick={() => generateInvoice(order)}
                              className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              <FiCreditCard className="inline mr-2" />
                              Download Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
