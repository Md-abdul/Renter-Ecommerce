import "./App.css";
import React from "react";
import { TopNavbar } from "./Components/HomePage/Navbar/Navbar";
import AllRoutes from "./Routes/AllRoutes";

function App() {
  return (
    <React.Fragment>
      <TopNavbar />
      <AllRoutes />
    </React.Fragment>
  );
}

export default App;
