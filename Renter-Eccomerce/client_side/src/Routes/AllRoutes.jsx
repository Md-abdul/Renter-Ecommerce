// import { Route, Routes } from "react-router-dom";
// import HomePage from "../Components";
// import ProductList from "../Pages/ProductPage.jsx/ProductList";
// import SingleProductPage from "../Pages/ProductPage.jsx/SingleProductPage";
// import CartPage from "../Pages/ProductPage.jsx/CartPage";
// import CheckoutPage from "../Pages/ProductPage.jsx/CheckoutPage";
// import LoginPage from "../Pages/LoginPage";
// import SignupPage from "../Pages/Signup";
// import PrivateRoutes from "./PrivateRoutes";
// import StoreLocator from "../Pages/StoreLocator/StoreLocator";
// import AboutPage from "../Pages/Contact_About/About";
// import ContactPage from "../Pages/Contact_About/contact";
// import AdminDashboard from "../Admin/AdminDashboard ";
// import UserOrders from "../Pages/ProductPage.jsx/UserOrders";
// import UserProfile from "../Pages/Users/UserProfile";

// const AllRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<HomePage />} />
//       <Route path="/mens" element={<ProductList category="mens" />} />
//       <Route path="/womens" element={<ProductList category="womens" />} />
//       <Route path="/kids" element={<ProductList category="kids" />} />
//       <Route path="/storelocator" element={<StoreLocator />} />
//       <Route path="/product/:_id" element={<SingleProductPage />} />
//       <Route
//         path="/productCart"
//         element={
//           <PrivateRoutes>
//             <CartPage />
//           </PrivateRoutes>
//         }
//       />
//       <Route path="/checkout" element={<CheckoutPage />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/signup" element={<SignupPage />} />
//       {/* <Route path="/productCart/" element={<CartPage />} /> */}
//       <Route path="/checkout" element={<CheckoutPage />} />

//       <Route path="/sotrelocator" element={<StoreLocator />} />
//       <Route path="/aboutpage" element={<AboutPage />} />
//       <Route path="/contactpage" element={<ContactPage />} />
//       <Route path="/order" element={<UserOrders />} />
//       <Route path="/*" element={<HomePage />} />

//       {/* user routes */}
//       <Route path="/user/profile" element={<UserProfile />} />

//       {/* admin routes */}
//       <Route
//         path="/adminDashboard"
//         element={
//           // <PrivateRoutes>
//           <AdminDashboard />
//           // </PrivateRoutes>
//         }
//       />
//     </Routes>
//   );
// };

// export default AllRoutes;

import { Route, Routes } from "react-router-dom";
import HomePage from "../Components";
import ProductList from "../Pages/ProductPage.jsx/ProductList";
import SingleProductPage from "../Pages/ProductPage.jsx/SingleProductPage";
import CartPage from "../Pages/ProductPage.jsx/CartPage";
import CheckoutPage from "../Pages/ProductPage.jsx/CheckoutPage";
import LoginPage from "../Pages/LoginPage";
import SignupPage from "../Pages/Signup";
import PrivateRoutes from "./PrivateRoutes";
import StoreLocator from "../Pages/StoreLocator/StoreLocator";
import AboutPage from "../Pages/Contact_About/About";
import ContactPage from "../Pages/Contact_About/contact";
import AdminDashboard from "../Admin/AdminDashboard ";
import UserOrders from "../Pages/ProductPage.jsx/UserOrders";
import UserProfile from "../Pages/Users/UserProfile";
import ProfileDetails from "../Pages/Users/ProfileDetails";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mens" element={<ProductList category="mens" />} />
      <Route path="/womens" element={<ProductList category="womens" />} />
      <Route path="/kids" element={<ProductList category="kids" />} />
      <Route path="/storelocator" element={<StoreLocator />} />
      <Route path="/product/:_id" element={<SingleProductPage />} />
      <Route
        path="/productCart"
        element={
          <PrivateRoutes>
            <CartPage />
          </PrivateRoutes>
        }
      />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/sotrelocator" element={<StoreLocator />} />
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/contactpage" element={<ContactPage />} />
      <Route path="/*" element={<HomePage />} />

      {/* User Profile Section with Nested Routes */}
      <Route
        path="/user"
        element={
          <PrivateRoutes>
            <UserProfile />
          </PrivateRoutes>
        }
      >
        <Route index element={<ProfileDetails />} /> {/* Default route */}
        <Route path="profile" element={<ProfileDetails />} />
        <Route path="orders" element={<UserOrders />} />{" "}
        {/* Changed from /order to orders */}
      </Route>

      {/* Admin routes */}
      <Route path="/adminDashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AllRoutes;
