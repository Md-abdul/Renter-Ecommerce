import { Route, Routes } from "react-router-dom";
import HomePage from "../Components";
import ProductList from "../Pages/ProductPage.jsx/ProductList";
import SingleProductPage from "../Pages/ProductPage.jsx/SingleProductPage";
import CartPage from "../Pages/ProductPage.jsx/CartPage";
import CheckoutPage from "../Pages/ProductPage.jsx/CheckoutPage";
import LoginPage from "../Pages/LoginPage";
import SignupPage from "../Pages/Signup";
// import { StoreLocator } from "../Pages/ExtraPages/StoreLocator";
import PrivateRoutes from "./PrivateRoutes";
import StoreLocator from "../Pages/StoreLocator/StoreLocator";
import AboutPage from "../Pages/Contact_About/About";
import ContactPage from "../Pages/Contact_About/contact";

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
        path="/productCart/:_id"
        element={
          <PrivateRoutes>
            <CartPage />
          </PrivateRoutes>
        }
      />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* <Route path="/productCart/" element={<CartPage />} /> */}
      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="/sotrelocator" element={<StoreLocator />} />
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/contactpage" element={<ContactPage />} />
      {/* <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} /> */}
      <Route path="/*" element={<HomePage />} />
    </Routes>
  );
};

export default AllRoutes;
