import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiUser, FiMail, FiPhone, FiHome, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ProfileDetails = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [errors, setErrors] = useState({
    phoneNumber: "",
  });

  const userDataa = JSON.parse(localStorage.getItem("user"));
  const userId = userDataa?.userId;

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(
        `https://renter-ecommerce-2.onrender.com/api/user/userDetails`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(response.data.user);
      setEditData({
        name: response.data.user.name,
        email: response.data.user.email,
        phoneNumber: response.data.user.phoneNumber || "",
        address: response.data.user.address || "",
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setErrors({ phoneNumber: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phoneNumber") {
      if (value.length > 10) {
        setErrors({
          ...errors,
          phoneNumber: "Phone number must be 10 digits or less",
        });
        return;
      } else {
        setErrors({
          ...errors,
          phoneNumber: "",
        });
      }
      
      if (!/^\d*$/.test(value)) {
        return;
      }
    }
    
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (errors.phoneNumber) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      await axios.put(`https://renter-ecommerce-2.onrender.com/api/user/${userId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully");
      fetchUserDetails();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center mb-6">
          <Link
            to="/user"
            className="flex items-center text-gray-700 hover:text-yellow-400 transition-colors mr-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                My Profile
              </h1>
              {userData && !isEditing && (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors shadow-md cursor-pointer"
                >
                  <FiEdit2 className="text-lg" /> Edit Profile
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            ) : isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiUser className="mr-2 text-yellow-800" /> Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiMail className="mr-2 text-yellow-500" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiPhone className="mr-2 text-yellow-500" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editData.phoneNumber}
                      onChange={handleInputChange}
                      maxLength={10}
                      placeholder="10-digit number"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.phoneNumber
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-yellow-400"
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="phoneValidation"
                        checked={editData.phoneNumber.length <= 10}
                        readOnly
                        className="mr-2 accent-yellow-400"
                      />
                      <label
                        htmlFor="phoneValidation"
                        className={`text-xs ${
                          editData.phoneNumber.length <= 10
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {editData.phoneNumber.length <= 10
                          ? "Valid phone number length"
                          : "Phone number too long"}
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiHome className="mr-2 text-yellow-500" /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || errors.phoneNumber}
                    className={`px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors shadow-md ${
                      (loading || errors.phoneNumber) && "opacity-70 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : userData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors group">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-yellow-100 rounded-full mr-3 group-hover:bg-yellow-200 transition-colors">
                        <FiUser className="text-yellow-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">
                      {userData.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors group">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-yellow-100 rounded-full mr-3 group-hover:bg-yellow-200 transition-colors">
                        <FiMail className="text-yellow-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">
                      {userData.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors group">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-yellow-100 rounded-full mr-3 group-hover:bg-yellow-200 transition-colors">
                        <FiPhone className="text-yellow-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Phone Number
                      </h3>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">
                      {userData.phoneNumber || (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors group">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-yellow-100 rounded-full mr-3 group-hover:bg-yellow-200 transition-colors">
                        <FiHome className="text-yellow-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Address
                      </h3>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">
                      {userData.address || (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No user data found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;