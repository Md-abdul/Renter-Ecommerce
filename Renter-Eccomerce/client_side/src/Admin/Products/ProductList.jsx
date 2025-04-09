import React, { useState, useEffect } from "react";
import ProductForm from "./ProductForm";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleUploadModal = () => setUploadModalOpen(!uploadModalOpen);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setProducts(products.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      alert("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", excelFile);

    try {
      const response = await fetch(
        "http://localhost:5000/api/products/upload-excel",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Refresh product list
        const productsResponse = await fetch(
          "http://localhost:5000/api/products"
        );
        const productsData = await productsResponse.json();
        setProducts(productsData);

        alert(data.message);
        setUploadModalOpen(false);
        setExcelFile(null);
      } else {
        throw new Error(data.error || "Failed to upload products");
      }
    } catch (error) {
      console.error("Error uploading products:", error);
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setCurrentProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Product
          </button>
          <button
            onClick={toggleUploadModal}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Upload Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {product.colors?.[0]?.images?.[0]?.imageUrl && (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.colors[0].images[0].imageUrl}
                          alt={product.title}
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.summary?.substring(0, 30)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${product.price}</div>
                  {product.offerPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ${product.offerPrice}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setCurrentProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="mr-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={toggleModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                product={currentProduct}
                setProducts={setProducts}
                products={products}
                onClose={toggleModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Excel Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Products from Excel
              </h3>
              <button
                onClick={toggleUploadModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={toggleUploadModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExcelUpload}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Upload
                </button>
              </div>
              <div className="mt-6 text-sm text-gray-600">
                <p className="mb-2">
                  Download the template file to ensure correct format:
                </p>
                <a
                  href="/product_template.xlsx"
                  download="product_template.xlsx"
                  className="text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Download Excel Template
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
