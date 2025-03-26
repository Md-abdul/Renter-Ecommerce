import React from "react";

const DashboardWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
        <p className="text-2xl font-bold mt-2">245</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
        <p className="text-2xl font-bold mt-2">1,234</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
        <p className="text-2xl font-bold mt-2">568</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
        <p className="text-2xl font-bold mt-2">$12,345</p>
      </div>
    </div>
  );
};

export default DashboardWidgets;