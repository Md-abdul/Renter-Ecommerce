import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import Pagination from "../AdminUtils/Pagination";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    couponCode: "",
    discountPercentage: "",
    minimumPurchaseAmount: "",
    maxDiscountAmount: "",
    expiryDate: "",
    usageLimit: 1,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleTokenError = () => {
    toast.error("Session expired. Please login again.");
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      console.log("adminToken:", token); // Debug log

      if (!token) {
        handleTokenError();
        return;
      }

      const response = await axios.get(
        `https://renter-ecommerce.vercel.app/api/coupons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCoupons(response.data);
    } catch (error) {
      console.error("Error details:", error.response || error); // Debug log
      if (error.response?.status === 401) {
        handleTokenError();
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch coupons");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pagination logic
  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCoupons = coupons.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleTokenError();
        return;
      }

      const url = editingCoupon
        ? `https://renter-ecommerce.vercel.app/api/coupons/${editingCoupon._id}`
        : `https://renter-ecommerce.vercel.app/api/coupons`;

      const method = editingCoupon ? "put" : "post";

      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(
        editingCoupon
          ? "Coupon updated successfully"
          : "Coupon created successfully"
      );
      setIsModalOpen(false);
      setEditingCoupon(null);
      setFormData({
        couponCode: "",
        discountPercentage: "",
        minimumPurchaseAmount: "",
        maxDiscountAmount: "",
        expiryDate: "",
        usageLimit: 1,
      });
      fetchCoupons();
    } catch (error) {
      if (error.response?.status === 401) {
        handleTokenError();
      } else {
        toast.error(error.response?.data?.message || "Failed to save coupon");
      }
    }
  };

  const handleDeleteClick = (couponId) => {
    setCouponToDelete(couponId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleTokenError();
        return;
      }

      await axios.delete(
        `https://renter-ecommerce.vercel.app/api/coupons/${couponToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      if (error.response?.status === 401) {
        handleTokenError();
      } else {
        toast.error(error.response?.data?.message || "Failed to delete coupon");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      couponCode: coupon.couponCode,
      discountPercentage: coupon.discountPercentage,
      minimumPurchaseAmount: coupon.minimumPurchaseAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      expiryDate: new Date(coupon.expiryDate).toISOString().split("T")[0],
      usageLimit: coupon.usageLimit,
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
        <p className="text-gray-600">Coupon Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setFormData({
              couponCode: "",
              discountPercentage: "",
              minimumPurchaseAmount: "",
              maxDiscountAmount: "",
              expiryDate: "",
              usageLimit: 1,
            });
            setIsModalOpen(true);
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-yellow-600 transition-colors cursor-pointer"
        >
          <FiPlus className="mr-2" /> Create Coupon
        </button>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min. Purchase
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
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
            {paginatedCoupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {coupon.couponCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.discountPercentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{coupon.minimumPurchaseAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{coupon.maxDiscountAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(coupon.expiryDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.usedCount}/{coupon.usageLimit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      coupon.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3 cursor-pointer"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(coupon._id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Add Pagination */}
        {coupons.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="p-6 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  required
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  required
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min. Purchase (₹)
                </label>
                <input
                  type="number"
                  name="minimumPurchaseAmount"
                  value={formData.minimumPurchaseAmount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  required
                  placeholder="Minimum amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Discount (₹)
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  required
                  placeholder="Maximum discount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  required
                  placeholder="Number of uses"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
              >
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="p-6 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Confirm Deletion
            </h2>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this coupon? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Styles */}
      <style jsx global>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          margin-right: -50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 0;
          border-radius: 0.5rem;
          width: 100%;
          max-width: 32rem;
          outline: none;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default Coupons;
