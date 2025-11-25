import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import Pagination from "../AdminUtils/Pagination";

const PaymentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        // "http://localhost:5000/api/phonepe/transactions",
          "https://renter-ecommerce.vercel.app/api/phonepe/transactions",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch payment transactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <FiCheckCircle className="text-green-500" />;
      case "FAILED":
        return <FiXCircle className="text-red-500" />;
      case "PENDING":
      case "INITIATED":
        return <FiClock className="text-yellow-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PENDING":
      case "INITIATED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.paymentStatus === filter;
  });

      // Pagination logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

      // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const exportTransactions = () => {
    const csvContent = [
      [
        "Transaction ID",
        "Order ID",
        "User Name",
        "User Email",
        "Amount",
        "Status",
        "Date",
        "PhonePe Transaction ID",
      ].join(","),
      ...filteredTransactions.map((transaction) =>
        [
          transaction.merchantTransactionId,
          transaction.orderId?.orderNumber || "N/A",
          transaction.userDetails?.name || "N/A",
          transaction.userDetails?.email || "N/A",
          transaction.amount,
          transaction.paymentStatus,
          formatDate(transaction.createdAt),
          transaction.phonepeTransactionId || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalAmount = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const completedTransactions = filteredTransactions.filter(
    (transaction) => transaction.paymentStatus === "COMPLETED"
  );

  const successRate =
    filteredTransactions.length > 0
      ? (
          (completedTransactions.length / filteredTransactions.length) *
          100
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-2">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payment Transactions
        </h1>
        <p className="text-gray-600">
          Monitor all PhonePe payment transactions and their status
        </p>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FiDollarSign className="text-2xl text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatAmount(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FiCheckCircle className="text-2xl text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-800">
                {completedTransactions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FiXCircle className="text-2xl text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  filteredTransactions.filter(
                    (t) => t.paymentStatus === "FAILED"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FiRefreshCw className="text-2xl text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-800">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "COMPLETED"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("FAILED")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "FAILED"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Failed
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "PENDING"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <FiRefreshCw className="text-sm" />
              Refresh
            </button>
            <button
              onClick={exportTransactions}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <FiDownload className="text-sm" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-fit">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.merchantTransactionId}
                      </div>
                      {transaction.phonepeTransactionId && (
                        <div className="text-sm text-gray-500">
                          {transaction.phonepeTransactionId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.userDetails?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.userDetails?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      #{transaction.orderId?.orderNumber || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.orderId?.status || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.paymentStatus
                      )}`}
                    >
                      {getStatusIcon(transaction.paymentStatus)}
                      <span className="ml-1">{transaction.paymentStatus}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <FiEye className="text-sm" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No transactions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No payment transactions match your current filter.
            </p>
          </div>
        )}
      </div>

          {/* Add Pagination */}
    <div className="px-6 py-4 border-t border-gray-200">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Merchant Transaction ID
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.merchantTransactionId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      PhonePe Transaction ID
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.phonepeTransactionId || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatAmount(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedTransaction.paymentStatus
                      )}`}
                    >
                      {getStatusIcon(selectedTransaction.paymentStatus)}
                      <span className="ml-1">
                        {selectedTransaction.paymentStatus}
                      </span>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User Details
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>
                      Name: {selectedTransaction.userDetails?.name || "N/A"}
                    </p>
                    <p>
                      Email: {selectedTransaction.userDetails?.email || "N/A"}
                    </p>
                    <p>
                      Phone:{" "}
                      {selectedTransaction.userDetails?.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Products
                  </label>
                  <div className="mt-1">
                    {selectedTransaction.productDetails?.map(
                      (product, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-900 border-b pb-2 mb-2"
                        >
                          <p className="font-medium">{product.name}</p>
                          <p>
                            Quantity: {product.quantity} | Price:{" "}
                            {formatAmount(product.price)}
                          </p>
                          <p>
                            Color: {product.color} | Size: {product.size}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Initiated At
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedTransaction.initiatedAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Completed At
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaction.completedAt
                        ? formatDate(selectedTransaction.completedAt)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTransactions;

