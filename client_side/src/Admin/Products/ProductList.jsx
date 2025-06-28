import React, { useState, useEffect } from "react";
import ProductForm from "./ProductForm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 items per page

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://renter-ecommerce.onrender.com/api/products"
      );
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductUpdate = async () => {
    await fetchProducts(); // Refetch the latest data
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://renter-ecommerce.onrender.com/api/products/${productToDelete._id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setProducts(products.filter((p) => p._id !== productToDelete._id));
        setDeleteModalOpen(false);
        toast.success("Product deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      const response = await fetch(
        "https://renter-ecommerce.onrender.com/api/products/upload-excel",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        const productsResponse = await fetch(
          "https://renter-ecommerce.onrender.com/api/products"
        );
        const productsData = await productsResponse.json();
        setProducts(productsData);

        toast.success(data.message);
        setUploadModalOpen(false);
        setExcelFile(null);
      } else {
        throw new Error(data.error || "Failed to upload products");
      }
    } catch (error) {
      console.error("Error uploading products:", error);
      toast.error(error.message);
    }
  };

  // Calculate total quantity for a product
  // const calculateTotalQuantity = (product) => {
  //   return product.sizes.reduce((total, size) => total + size.quantity, 0);
  // };

  const calculateTotalQuantity = (product) => {
    return (product.sizes || []).reduce(
      (total, size) => total + (size.quantity || 0),
      0
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current products
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Function to generate page numbers with dots
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Show max 5 pages at a time

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftBound = Math.max(currentPage - 2, 1);
      const rightBound = Math.min(currentPage + 2, totalPages);

      if (currentPage - 1 > 2) {
        pageNumbers.push(1, "...");
      } else {
        for (let i = 1; i <= currentPage; i++) {
          pageNumbers.push(i);
        }
      }

      for (let i = leftBound; i <= rightBound; i++) {
        if (i !== 1 && i !== totalPages && !pageNumbers.includes(i)) {
          pageNumbers.push(i);
        }
      }

      if (totalPages - currentPage > 2) {
        if (!pageNumbers.includes(rightBound + 1)) {
          pageNumbers.push("...");
        }
        pageNumbers.push(totalPages);
      } else {
        for (let i = currentPage + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Product Management
          </h2>
          <p className="text-gray-600 mt-1">Manage all products in inventory</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setCurrentProduct(null);
              setIsModalOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Product
          </button>

          <button
            className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            onClick={() => setUploadModalOpen(true)}
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
            Upload Excel
          </button>
        </div>
      </div>

      {/* =============== */}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto rounded-lg shadow-md bg-white border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Pricing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Inventory
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                            {product.colors?.[0]?.images?.main ? (
                              <img
                                src={product.colors[0].images.main}
                                alt={product.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/80?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-base font-semibold text-gray-900">
                              {product.title}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span
                                className="inline-block w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    product.colors?.[0]?.hexCode || "#ccc",
                                }}
                              ></span>
                              {product.colors?.[0]?.name || "No Color"}
                              {product.colors?.length > 1 && (
                                <span className="ml-2 text-gray-400">
                                  +{product.colors.length - 1} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-semibold text-sm">
                            ₹{product.basePrice}
                          </span>
                          {product.discount > 0 && (
                            <span className="mt-1 text-green-600 text-xs font-medium">
                              {product.discount}% off
                            </span>
                          )}
                          {product.basePrice !== product.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 mt-1">
                            {product.colors.length} variants
                          </span>
                        </div>
                      </td>

                      {/* Inventory */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm font-semibold text-gray-800">
                            {calculateTotalQuantity(product)} in stock
                            {calculateTotalQuantity(product) <= 10 &&
                              calculateTotalQuantity(product) > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                  Low
                                </span>
                              )}
                            {calculateTotalQuantity(product) === 0 && (
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                                Out
                              </span>
                            )}
                          </div>
                          {/* <div className="text-xs text-gray-500 mt-1">
                            {
                              product.sizes?.filter((size) => size.available)
                                .length
                            }{" "}
                            active sizes
                          </div> */}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold rounded-full bg-gray-100 text-gray-700 px-2 py-1 w-fit capitalize">
                            {product.category}
                          </span>
                          {product.wearCategory && (
                            <span className="mt-1 text-xs rounded-full bg-blue-100 text-blue-800 px-2 py-1 w-fit capitalize">
                              {product.wearCategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-yellow-900 hover:text-yellow-800 bg-yellow-300 hover:bg-yellow-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center cursor-pointer"
                            onClick={() => {
                              setCurrentProduct(product);
                              setIsModalOpen(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors duration-200 flex items-center cursor-pointer"
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-16 text-center text-gray-500 text-sm"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-black hover:bg-yellow-300 hover:scale-105 transition-all duration-200"
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((number, index) =>
              number === "..." ? (
                <span key={`dots-${index}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                    currentPage === number
                      ? "bg-yellow-400 text-black font-medium"
                      : "text-black hover:bg-yellow-300 hover:scale-105"
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-black hover:bg-yellow-300 hover:scale-105 transition-all duration-200"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Add/Edit Product Modal - Updated for smoother experience */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-gray-500"
                  onClick={() => setIsModalOpen(false)}
                ></div>
              </motion.div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              {/* Modal Content - Pre-rendered but hidden until needed */}
              <div className="hidden sm:inline-block sm:align-middle sm:h-screen">
                &#8203;
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {currentProduct ? "Edit Product" : "Add New Product"}
                      </h3>
                      {/* The ProductForm is now always rendered but hidden */}
                      <div className={isModalOpen ? "block" : "hidden"}>
                        <ProductForm
                          product={currentProduct}
                          setProducts={setProducts}
                          products={products}
                          onClose={() => setIsModalOpen(false)}
                          onProductUpdate={handleProductUpdate}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Excel Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                Upload Products
              </h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
                    {excelFile ? (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-10 w-10 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-gray-900">
                          {excelFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round(excelFile.size / 1024)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-10 w-10 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium text-yellow-600">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Excel files only (.xlsx, .xls)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                  </div>
                </label>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>
                  Need the template file?{" "}
                  <button
                    onClick={() => {
                      // Create a sample Excel data structure
                      const templateData = [
                        [
                          "title",
                          "summary",
                          "price",
                          "offerPrice",
                          "discount",
                          "rating",
                          "reviews",
                          "Color Name",
                          "Hex Code",
                          "Main Image",
                          "Sub Image 1",
                          "Sub Image 2",
                          "Sub Image 3",
                          "Sub Image 4",
                          "Switch Image",
                          "Size",
                          "SKU",
                          "Quantity",
                        ],
                        [
                          "Men's T-Shirt",
                          "A cool cotton T-shirt for men",
                          499,
                          399,
                          20,
                          4.2,
                          34,
                          "Red",
                          "#FF0000",
                          "https://example.com/red1.jpg",
                          "https://example.com/red2.jpg",
                          "https://example.com/red3.jpg",
                          "https://example.com/red4.jpg",
                          "https://example.com/red5.jpg",
                          "https://example.com/red-alt.jpg",
                          "M",
                          "D-01-Red-M",
                          5,
                        ],
                      ];

                      // Convert to CSV format
                      const csvContent = templateData
                        .map((row) => row.join(","))
                        .join("\n");

                      // Create download link
                      const blob = new Blob([csvContent], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", "product_template.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-yellow-600 hover:text-yellow-500 font-medium transition-colors duration-200 cursor-pointer"
                  >
                    Download template
                  </button>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExcelUpload}
                disabled={!excelFile}
                className={`px-5 py-2 text-black rounded-lg focus:outline-none transition-colors duration-200 cursor-pointer ${
                  excelFile
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-yellow-300 cursor-not-allowed"
                }`}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete product:{" "}
                <strong className="text-gray-900">
                  {productToDelete?.title}
                </strong>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-200"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none transition-colors duration-200 cursor-pointer"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
