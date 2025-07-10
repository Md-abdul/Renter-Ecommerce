import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MapComponent from "./MapComponent";
import { FiRefreshCw, FiEdit, FiTrash2, FiMapPin } from "react-icons/fi";

const StoreLocator_Admin = () => {
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    coordinates: ["", ""],
  });
  const [editingId, setEditingId] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState([72.8777, 19.076]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://renter-ecommerce.vercel.app/api/stores"
      );
      setStores(response.data);
    } catch (error) {
      toast.error("Failed to fetch stores");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStore = async (id) => {
    try {
      await axios.delete(
        `https://renter-ecommerce.vercel.app/api/stores/${id}`
      );
      toast.success("Store deleted successfully");
      fetchStores();
    } catch (error) {
      toast.error("Failed to delete store");
    } finally {
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
    }
  };

  const openDeleteConfirmation = (id) => {
    setStoreToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteModalOpen(false);
    setStoreToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCoordinateChange = (index, value) => {
    const newCoordinates = [...formData.coordinates];
    newCoordinates[index] = parseFloat(value) || 0;
    setFormData({
      ...formData,
      coordinates: newCoordinates,
    });
  };

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    setFormData({
      ...formData,
      coordinates: [lng, lat],
    });
    setMapCoordinates([lng, lat]);
    setIsMapModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `https://renter-ecommerce.vercel.app/api/stores/${editingId}`,
          formData
        );
        toast.success("Store updated successfully");
      } else {
        await axios.post(
          "https://renter-ecommerce.vercel.app/api/stores",
          formData
        );
        toast.success("Store added successfully");
      }
      resetForm();
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving store");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      phone: "",
      coordinates: ["", ""],
    });
    setEditingId(null);
  };

  const editStore = (store) => {
    setFormData({
      name: store.name,
      address: store.address,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      country: store.country,
      phone: store.phone,
      coordinates: store.coordinates,
    });
    setEditingId(store._id);
  };

  // const deleteStore = async https://renter-ecommerce.vercel.app/
  //   if (window.confirm("Are you sure you want to delete this store?")) {
  //     try {
  //       await axios.delete(`http://localhost:5000/api/stores/${id}`);
  //       toast.success("Store deleted successfully");
  //       fetchStores();
  //     } catch (error) {
  //       toast.error("Failed to delete store");
  //     }
  //   }
  // };

  // ... (keep all your existing handler functions the same)

  // Filter stores based on search term
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.pincode.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-1 md:p-2">
      <div className="max-w-8xl mx-auto -mt-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Store Management
            </h1>
            <p className="text-gray-600 mt-2">
              {editingId
                ? "Editing store details"
                : "Add and manage your retail locations"}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stores..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 h-full">
              <div className="bg-black px-6 py-4">
                <h2 className="text-xl font-semibold text-yellow-400">
                  {editingId ? "Edit Store" : "Add New Store"}
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Store Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                        placeholder="e.g. Main Branch"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Address*
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                        rows={3}
                        placeholder="Street address, building, etc."
                      />
                    </div>

                    {/* City and State */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City*
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State*
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Pincode and Country */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode*
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country*
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number*
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                        placeholder="e.g. 9876543210"
                      />
                    </div>

                    {/* Coordinates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Coordinates*
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          value={formData.coordinates[0]}
                          onChange={(e) =>
                            handleCoordinateChange(0, e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="Longitude"
                          required
                        />
                        <input
                          type="number"
                          step="any"
                          value={formData.coordinates[1]}
                          onChange={(e) =>
                            handleCoordinateChange(1, e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="Latitude"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
                      >
                        <FiMapPin className="h-5 w-5" />
                        Pick Location on Map
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                    >
                      {editingId ? "Update Store" : "Add Store"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Stores List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 h-full flex flex-col">
              <div className="bg-black px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-yellow-400">
                    All Stores
                  </h2>
                  <p className="text-yellow-300 text-sm mt-1">
                    {filteredStores.length}{" "}
                    {filteredStores.length === 1 ? "store" : "stores"} found
                  </p>
                </div>
                <button
                  onClick={() => fetchStores()}
                  className="p-2 text-yellow-400 hover:bg-gray-800 rounded-full cursor-pointer"
                  title="Refresh"
                >
                  <FiRefreshCw className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable list */}
              <div
                className="overflow-y-auto px-2"
                style={{ maxHeight: "700px" }}
              >
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
                  </div>
                ) : filteredStores.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No stores found.{" "}
                    {searchTerm && "Try a different search term."}
                  </div>
                ) : (
                  filteredStores.map((store) => (
                    <div
                      key={store._id}
                      className="p-6 hover:bg-gray-50 transition-colors border-t"
                    >
                      <div className="flex justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {store.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {store.address}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {store.city}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {store.pincode}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {store.phone}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => editStore(store)}
                            className="p-2 rounded-full hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700 cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirmation(store._id)}
                            className="p-2 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <FiMapPin className="mr-1.5 h-5 w-5 text-gray-400" />
                        {store.coordinates[0]}, {store.coordinates[1]}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-black text-yellow-400">
              <h3 className="text-lg font-semibold">Select Location on Map</h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-yellow-400 hover:text-yellow-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow relative">
              <MapComponent
                initialCenter={mapCoordinates}
                onMapClick={handleMapClick}
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end bg-gray-50">
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="px-6 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-black text-yellow-400">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <button
                onClick={closeDeleteConfirmation}
                className="text-yellow-400 hover:text-yellow-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this store? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDeleteConfirmation}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteStore(storeToDelete)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
                >
                  Delete Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreLocator_Admin;
