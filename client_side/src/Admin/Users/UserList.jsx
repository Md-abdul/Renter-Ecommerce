import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const UserList = () => {
  // State for user data and UI
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // New state for export modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("excel");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://renter-ecommerce-1.onrender.com/api/user/allUser"
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        address: currentUser?.address || "",
        phoneNumber: currentUser?.phoneNumber || "",
      });
    }
  }, [isModalOpen, currentUser]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = currentUser ? "PUT" : "POST";
      const url = currentUser
        ? `https://renter-ecommerce-1.onrender.com/api/user/${currentUser._id}`
        : "https://renter-ecommerce-1.onrender.com/api/user";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save user");

      const updatedUser = await response.json();
      if (currentUser) {
        setUsers(
          users.map((u) => (u._id === updatedUser._id ? updatedUser : u))
        );
      } else {
        setUsers([...users, updatedUser]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  const handleExport = () => {
    // Prepare data for export
    const dataToExport = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      "Phone Number": user.phoneNumber || "N/A",
      Address: user.address
        ? `${user.address.street || ""} ${user.address.city || ""} ${
            user.address.state || ""
          } ${user.address.zipCode || ""}`.trim()
        : "N/A",
    }));

    if (exportFormat === "excel") {
      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Generate Excel file and download
      XLSX.writeFile(wb, "users_data.xlsx");
      toast.success("Excel file downloaded successfully");
    } else {
      // Create CSV
      const csvContent = [
        Object.keys(dataToExport[0]).join(","),
        ...dataToExport.map((item) =>
          Object.values(item)
            .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV file downloaded successfully");
    }

    setExportModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://renter-ecommerce-1.onrender.com/api/user/${userToDelete._id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setDeleteModalOpen(false);
      toast.success("User Deleted Successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-gray-50">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage all registered users</p>
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
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Add this export button */}
          <button
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-600 text-black font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            onClick={() => setExportModalOpen(true)}
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
            Export
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-800 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {user._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.phoneNumber ? (
                          <span className="text-sm text-gray-600">
                            {user.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.address ? (
                          <div className="text-sm text-gray-600">
                            <div>{user.address.street || "N/A"}</div>
                            <div>
                              {user.address.city || ""}
                              {user.address.city && user.address.state
                                ? ", "
                                : ""}
                              {user.address.state || ""}{" "}
                              {user.address.zipCode || ""}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* <button
                            className="text-yellow-900 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center cursor-pointer"
                            onClick={() => {
                              setCurrentUser(user);
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
                          </button> */}
                          <button
                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center cursor-pointer"
                            onClick={() => {
                              setUserToDelete(user);
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
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">
                        {searchTerm
                          ? "No matching users found"
                          : "No users found"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm
                          ? "Try a different search term"
                          : "Get started by adding a new user"}
                      </p>
                      {!searchTerm && (
                        <div className="mt-6">
                          {/* <button
                            onClick={() => {
                              setCurrentUser(null);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            <svg
                              className="-ml-1 mr-2 h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Add User
                          </button> */}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto ">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed transition-opacity" aria-hidden="true">
              <div
                className="absolute bg-gray-500 opacity-75"
                onClick={() => setIsModalOpen(false)}
              ></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {currentUser ? "Edit User" : "Add New User"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Address
                        </label>
                        <textarea
                          type="text"
                          name="address"
                          id="address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          pattern="[0-9]{10}"
                          maxLength={10}
                          title="Please enter a 10-digit phone number"
                        />
                      </div>
                      <div className="pt-4 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          {currentUser ? "Update" : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete user:{" "}
                <strong className="text-gray-900">{userToDelete?.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-200 cursor-pointer"
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

      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Export Users Data
              </h3>
              <p className="text-gray-600 mb-4">
                Choose the format to export user data:
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <input
                    id="excel-format"
                    name="export-format"
                    type="radio"
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                    checked={exportFormat === "excel"}
                    onChange={() => setExportFormat("excel")}
                  />
                  <label
                    htmlFor="excel-format"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Excel (.xlsx)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="csv-format"
                    name="export-format"
                    type="radio"
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                    checked={exportFormat === "csv"}
                    onChange={() => setExportFormat("csv")}
                  />
                  <label
                    htmlFor="csv-format"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    CSV (.csv)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-200 cursor-pointer"
                  onClick={() => setExportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none transition-colors duration-200 cursor-pointer"
                  onClick={handleExport}
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
