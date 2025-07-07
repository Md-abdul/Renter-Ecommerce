import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiEdit2,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiArrowLeft,
} from "react-icons/fi";
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
    address: {
      street: "",
      city: "",
      zipCode: "",
      state: "",
      alternatePhone: "",
      addressType: "home",
    },
  });

  const [errors, setErrors] = useState({
    phoneNumber: "",
    alternatePhone: "",
  });

  const userDataa = JSON.parse(localStorage.getItem("user"));
  const userId = userDataa?.userId;

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(
        `https://renter-ecommerce.onrender.com/api/user/userDetails`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = response.data.user;
      setUserData(user);

      setEditData({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          zipCode: user.address?.zipCode || "",
          state: user.address?.state || "",
          alternatePhone: user.address?.alternatePhone || "",
          addressType: user.address?.addressType || "home",
        },
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
    setErrors({ phoneNumber: "", alternatePhone: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for phone numbers
    if (name === "phoneNumber" || name === "alternatePhone") {
      if (value.length > 10) {
        setErrors({
          ...errors,
          [name]: "Phone number must be 10 digits or less",
        });
        return;
      } else {
        setErrors({
          ...errors,
          [name]: "",
        });
      }

      if (!/^\d*$/.test(value)) {
        return;
      }
    }

    if (name === "alternatePhone") {
      setEditData((prev) => ({
        ...prev,
        address: { ...prev.address, alternatePhone: value },
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (errors.phoneNumber || errors.alternatePhone) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);

      await axios.put(
        `https://renter-ecommerce.onrender.com/api/user/${userId}`,
        {
          name: editData.name,
          email: editData.email,
          phoneNumber: editData.phoneNumber,
          address: {
            street: editData.address.street,
            city: editData.address.city,
            zipCode: editData.address.zipCode,
            state: editData.address.state,
            alternatePhone: editData.address.alternatePhone,
            addressType: editData.address.addressType,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
                  <FiEdit2 className="text-lg" /> Complete Profile
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            ) : isEditing ? (
              <div className="space-y-6">
                {/* Name field - editable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiUser className="mr-2 text-yellow-500" /> Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  {/* Email field - read-only */}
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiMail className="mr-2 text-yellow-500" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiPhone className="mr-2 text-yellow-500" /> Alternate
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={editData.address.alternatePhone}
                      onChange={handleInputChange}
                      maxLength={10}
                      placeholder="10-digit number"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.alternatePhone
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-yellow-400"
                      }`}
                    />
                    {errors.alternatePhone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.alternatePhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rest of the editing form remains the same */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiHome className="mr-2 text-yellow-500" /> Street
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={editData.address.street}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiHome className="mr-2 text-yellow-500" /> City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editData.address.city}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiHome className="mr-2 text-yellow-500" /> State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={editData.address.state}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                      <FiHome className="mr-2 text-yellow-500" /> Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={editData.address.zipCode}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: { ...prev.address, zipCode: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                    <FiHome className="mr-2 text-yellow-500" /> Address Type
                  </label>
                  <select
                    name="addressType"
                    value={editData.address.addressType}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          addressType: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
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
                    disabled={
                      loading || errors.phoneNumber || errors.alternatePhone
                    }
                    className={`px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors shadow-md cursor-pointer ${
                      (loading ||
                        errors.phoneNumber ||
                        errors.alternatePhone) &&
                      "opacity-70 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : userData ? (
              <div className="space-y-6">
                {/* Display mode remains the same */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors group">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-yellow-100 rounded-full mr-3 group-hover:bg-yellow-200 transition-colors">
                        <FiUser className="text-yellow-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Name
                      </h3>
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
                      <h3 className="text-sm font-medium text-gray-500">
                        Email
                      </h3>
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
                        <FiPhone className="text-yellow-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Alternate Phone
                      </h3>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">
                      {userData.address?.alternatePhone || (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors group">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-yellow-100 rounded-full mr-3 group-hover:bg-yellow-200 transition-colors">
                        <FiHome className="text-yellow-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Address ({userData.address?.addressType || "home"})
                      </h3>
                    </div>
                    <div className="text-xl font-semibold text-gray-800">
                      {userData.address?.street || (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {userData.address?.city}, {userData.address?.state}{" "}
                      {userData.address?.zipCode}
                    </div>
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
