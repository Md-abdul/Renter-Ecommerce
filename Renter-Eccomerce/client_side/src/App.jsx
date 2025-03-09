import "./App.css";
import React from "react";
import { TopNavbar } from "./Components/HomePage/Navbar/Navbar";
import AllRoutes from "./Routes/AllRoutes";
// import Cards from "./Components/HomePage/Crousel/Cards";

function App() {
  return (
    <React.Fragment>
      <TopNavbar />
      <div style={{marginTop: "50px"}}>
        <AllRoutes />
      </div>

    </React.Fragment>
  );
}

export default App;
