import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
//https://renter-ecommerce-1.onrender.com
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardCharts = () => {
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get("https://renter-ecommerce.onrender.com/api/products");
        const usersResponse = await axios.get("https://renter-ecommerce.onrender.com/api/user/allUser");
        
        const token = localStorage.getItem("adminToken");
        const ordersResponse = await axios.get("https://renter-ecommerce.onrender.com/api/orders/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProductsCount(productsResponse.data.length);
        setUsersCount(usersResponse.data.length);
        setOrdersCount(ordersResponse.data.length);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchData();
  }, []);

  const chartData = [
    { name: "Products", value: productsCount },
    { name: "Users", value: usersCount },
    { name: "Orders", value: ordersCount },
  ];

  // For line chart (Example: fake order growth)
  const lineChartData = [
    { month: "Jan", orders: 20 },
    { month: "Feb", orders: 40 },
    { month: "Mar", orders: 80 },
    { month: "Apr", orders: 100 },
    { month: "May", orders: 130 },
    { month: "Jun", orders: 170 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Product, User, Order Count</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barSize={50}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="url(#colorUv)" radius={[10, 10, 0, 0]}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#83a6ed" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Growth Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Overall Distribution</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
