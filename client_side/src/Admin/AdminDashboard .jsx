import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import DashboardContent from "./Dashboard";
import ProductsContent from "./Products";
import UsersContent from "./Users";
import { Orders } from "./Orders/Orders";
import SoldProduct from "./SoldProductData/SoldProduct";
import Coupons from "./SoldProductData/Coupons";
import StoreLocator_Admin from "./SoldProductData/StoreLocator_Admin";
import PaymentTransactions from "./PaymentTransactions/PaymentTransactions";
// import PagesAccess from "./SoldProductData/PagesAccess";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 -mt-12">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 overflow-auto">
        <AdminHeader
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="p-6">
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "products" && <ProductsContent />}
          {activeTab === "users" && <UsersContent />}
          {activeTab === "orders" && <Orders />}
          {activeTab === "billingrecords" && <SoldProduct />}
          {activeTab === "coupon" && <Coupons />}
          {activeTab === "storelocator_admin" && <StoreLocator_Admin />}
          {activeTab === "paymenttransactions" && <PaymentTransactions />}
          {/* {activeTab === "pageaccess" && <PagesAccess />} */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
