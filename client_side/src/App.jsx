import "./App.css";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { TopNavbar } from "./Components/HomePage/Navbar/Navbar";
import AllRoutes from "./Routes/AllRoutes";
import Footer from "./Components/HomePage/Footer/Footer";

function App() {
  const isAdmin = useSelector((state) => state?.UsersReducer.isAdmin);

  useEffect(() => {
    // Check on app load
    const isSessionActive = sessionStorage.getItem("isSessionActive");

    if (!isSessionActive) {
      // Session marker is gone (tab was closed)
      // But localStorage still has old tokens
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");

      // Reload the app
      window.location.reload();
    }

    // Always set the session marker for this tab
    sessionStorage.setItem("isSessionActive", "true");
  }, []);

  return (
    <>
      {!isAdmin && <TopNavbar />}
      <div style={{ marginTop: "50px" }}>
        <AllRoutes />
      </div>
      {!isAdmin && <Footer />}
    </>
  );
}

export default App;
