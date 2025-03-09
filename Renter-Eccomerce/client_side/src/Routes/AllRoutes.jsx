import { Route, Routes } from "react-router-dom";
import HomePage from "../Components";
import ProductList from "../Pages/ProductPage.jsx/ProductList";
import SingleProductPage from "../Pages/ProductPage.jsx/SingleProductPage";
import CartPage from "../Pages/ProductPage.jsx/CartPage";
import CheckoutPage from "../Pages/ProductPage.jsx/CheckoutPage";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/mens"
        element={<ProductList category="mens"  />}
      />
      <Route
        path="/womens"
        element={<ProductList category="womens"  />}
      />
      <Route
        path="/kids"
        element={<ProductList category="kids"  />}
      />

      <Route path="/product/:_id" element={<SingleProductPage />} />
      <Route path="/productCart/:_id" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      {/* <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} /> */}
      <Route path="/*" element={<HomePage />} />
    </Routes>
  );
};

export default AllRoutes;
