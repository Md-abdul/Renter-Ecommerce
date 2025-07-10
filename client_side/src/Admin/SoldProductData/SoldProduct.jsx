import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  parseISO,
  isValid as isDateValid,
} from "date-fns";
import * as XLSX from "xlsx";

const SoldProduct = () => {
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDefaultDate, setIsDefaultDate] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [totalAmounts, setTotalAmounts] = useState(0);

  // Calculate total amount whenever soldProducts changes
  useEffect(() => {
    const calculatedTotal = soldProducts.reduce(
      (sum, product) => sum + product.total,
      0
    );
    setTotalAmounts(calculatedTotal);
  }, [soldProducts]);

  // Safe date formatter
  const safeFormat = (date, formatStr) => {
    if (!date) return "N/A";
    const parsedDate =
      typeof date === "string" ? parseISO(date) : new Date(date);
    return isDateValid(parsedDate)
      ? format(parsedDate, formatStr)
      : "Invalid Date";
  };

  const fetchSoldProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://renter-ecommerce.vercel.app/api/orders/sold-products",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate,
            endDate,
          },
        }
      );
      setSoldProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sold products");
      console.error("Error fetching sold products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default to current month on first load
    if (!startDate && !endDate) {
      const today = new Date();
      setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
      setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
      setIsDefaultDate(true);
    }
    fetchSoldProducts();
  }, [startDate, endDate]);

  const handleDateFilter = (e) => {
    e.preventDefault();
    setIsDefaultDate(false);
    fetchSoldProducts();
  };

  const resetDateFilter = () => {
    const today = new Date();
    setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
    setIsDefaultDate(true);
  };

  const prepareDownload = () => {
    setShowDownloadModal(true);
  };

  const confirmDownload = () => {
    downloadExcel();
    setShowDownloadModal(false);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      soldProducts.map((product) => ({
        "S.No.": soldProducts.indexOf(product) + 1,
        "Product Name": product.title,
        Category: `${product.category} (${product.wearCategory})`,
        "Unit Price (₹)": product.price.toFixed(2),
        Size: product.size,
        Color: product.color,
        Quantity: product.quantity,
        "Total Amount (₹)": product.total.toFixed(2),
        "Delivered Date": safeFormat(product.deliveredDate, "dd-MMM-yyyy"),
        SKU: product.sku,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sold Products");

    // Get current date for filename
    const today = new Date();
    const dateStr = format(today, "ddMMMyyyy");

    XLSX.writeFile(workbook, `SoldProducts_${dateStr}.xlsx`);
  };

  return (
    <div className="container mx-auto px-2 py-4">
      {/* Download Confirmation Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Confirm Download
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to download the Excel file with{" "}
                {soldProducts.length} records?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowDownloadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-5 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 focus:outline-none transition-colors duration-200 cursor-pointer"
                  onClick={confirmDownload}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Sold Products Report
        </h1>
        {soldProducts.length > 0 && (
          <button
            onClick={prepareDownload}
            className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 flex items-center gap-2 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download Excel
          </button>
        )}
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Filter by Delivery Date
        </h2>
        {isDefaultDate && (
          <div className="flex justify-between items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-md mb-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              Showing data for current month:{" "}
              {safeFormat(startDate, "MMMM yyyy")}
            </div>
            {soldProducts.length > 0 && (
              <div className="text-lg font-semibold">
                Total: ₹{Math.floor(totalAmounts.toFixed(2))}
              </div>
            )}
          </div>
        )}
        <form
          onSubmit={handleDateFilter}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 cursor-pointer"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={resetDateFilter}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-gray-600">Loading sold products...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>{error}</div>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-black">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    S.No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    Delivered On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider border-b border-gray-200">
                    SKU
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {soldProducts.length > 0 ? (
                  soldProducts.map((product, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-yellow-50 hover:bg-yellow-100"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                        {product.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                        <span className="capitalize">{product.category}</span> (
                        {product.wearCategory})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                        ₹{Math.floor(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                        {product.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                        ₹{(product.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                        {safeFormat(product.deliveredDate, "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {product.sku}
                        </code>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-gray-600">
                          No sold products found in the selected date range
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          Try adjusting your date filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoldProduct;
