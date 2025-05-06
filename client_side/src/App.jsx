import "./App.css";
import React from "react";
import { useSelector } from "react-redux";
import { TopNavbar } from "./Components/HomePage/Navbar/Navbar";
import AllRoutes from "./Routes/AllRoutes";
import Footer from "./Components/HomePage/Footer/Footer";

function App() {
  const isAdmin = useSelector((state) => state?.UsersReducer.isAdmin); // Ensure this matches your Redux state structure
  // console.log(isAdmin);

  return (
    <React.Fragment>
      {!isAdmin && <TopNavbar />}
      <div style={{ marginTop: "50px" }}>
        <AllRoutes />
      </div>
      {!isAdmin && <Footer />}
    </React.Fragment>
  );
}

export default App;
