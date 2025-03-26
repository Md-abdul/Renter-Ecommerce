import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

const UserList = () => {
  // State for user data and UI
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        const response = await fetch("http://localhost:5000/api/user/allUser");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = currentUser ? "PUT" : "POST";
      const url = currentUser
        ? `http://localhost:5000/api/user/${currentUser._id}`
        : "http://localhost:5000/api/user";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        if (currentUser) {
          setUsers(
            users.map((u) => (u._id === updatedUser._id ? updatedUser : u))
          );
        } else {
          setUsers([...users, updatedUser]);
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user/${userToDelete._id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userToDelete._id));
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header and Add User Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <Button
          color="primary"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
          onClick={() => {
            setCurrentUser(null);
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
          Add User
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.address || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            color="primary"
                            size="sm"
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm shadow-sm transition-colors duration-200 flex items-center gap-1"
                            onClick={() => {
                              setCurrentUser(user);
                              setIsModalOpen(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm shadow-sm transition-colors duration-200 flex items-center gap-1"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
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
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No users found. Click "Add User" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Modal isOpen={isModalOpen} toggle={toggleModal} className="rounded-lg">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <ModalHeader
            toggle={toggleModal}
            className="border-b border-gray-200 px-6 py-4"
          >
            <h3 className="text-lg font-medium text-gray-900">
              {currentUser ? "Edit User" : "Add New User"}
            </h3>
          </ModalHeader>
          <ModalBody className="px-6 py-4">
            <Form onSubmit={handleSubmit}>
              <FormGroup className="mb-4">
                <Label
                  for="name"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Name
                </Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup className="mb-4">
                <Label
                  for="email"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email
                </Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup className="mb-4">
                <Label
                  for="address"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Address
                </Label>
                <Input
                  type="text"
                  name="address"
                  id="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup className="mb-6">
                <Label
                  for="phoneNumber"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Phone Number
                </Label>
                <Input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                />
              </FormGroup>
              <div className="flex justify-end space-x-3">
                <Button
                  color="secondary"
                  onClick={toggleModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currentUser ? "Update" : "Save"}
                </Button>
              </div>
            </Form>
          </ModalBody>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        toggle={toggleDeleteModal}
        className="rounded-lg"
      >
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <ModalHeader
            toggle={toggleDeleteModal}
            className="border-b border-gray-200 px-6 py-4"
          >
            <h3 className="text-lg font-medium text-gray-900">
              Confirm Delete
            </h3>
          </ModalHeader>
          <ModalBody className="px-6 py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete user:{" "}
              <strong className="text-gray-900">{userToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                color="secondary"
                onClick={toggleDeleteModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md shadow-sm transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors duration-200"
              >
                Delete
              </Button>
            </div>
          </ModalBody>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
