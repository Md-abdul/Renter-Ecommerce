import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardWidgets = () => {
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await axios.get(
          "https://renter-ecommerce-2.onrender.com/api/products"
        );
        setProductsCount(productsResponse.data.length);

        // Fetch users
        const usersResponse = await axios.get(
          "https://renter-ecommerce-2.onrender.com/api/user/allUser"
        );
        setUsersCount(usersResponse.data.length);

        // Fetch orders (with token)
        const token = localStorage.getItem("adminToken");
        const ordersResponse = await axios.get(
          "https://renter-ecommerce-2.onrender.com/api/orders/admin",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrdersCount(ordersResponse.data.length);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
        <p className="text-2xl font-bold mt-2">{productsCount}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
        <p className="text-2xl font-bold mt-2">{usersCount}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
        <p className="text-2xl font-bold mt-2">{ordersCount}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
        <p className="text-2xl font-bold mt-2">$12,345</p>{" "}
        {/* You can later make this dynamic if needed */}
      </div>
    </div>
  );
};

export default DashboardWidgets;
