import { Route, Routes } from "react-router-dom";
import HomePage from "../Components/index.jsx";
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
import AuthRedirect from "../Pages/AuthRedirect";
import PaymentStatus from "../Pages/PaymentStatus";
import TermOfUses from "../Pages/ExtraPages/TermOfUses.jsx";
import PrivacyPolicy from "../Pages/ExtraPages/PrivacyPolicy.jsx";
import Return from "../Pages/ExtraPages/Return.jsx";
import ForgotPasswordPage from "../Pages/ForgotPasswordPage.jsx";
import StoreLocator_Admin from "../Admin/SoldProductData/StoreLocator_Admin.jsx";
import ShippingPolicy from "../Pages/ExtraPages/ShippingPolicy.jsx";
// import PagesAccess from "../Admin/SoldProductData/PagesAccess.jsx";

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
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/contactpage" element={<ContactPage />} />
      <Route path="/order" element={<UserOrders />} />
      <Route path="/forgot_password" element={<ForgotPasswordPage />} />
      <Route path="/payment-status" element={<PaymentStatus />} />
      <Route path="/*" element={<HomePage />} />

      <Route path="/term-of-uses" element={<TermOfUses />} />
      <Route path="/term-of-return" element={<Return />} />
      <Route path="/term-of-privacy" element={<PrivacyPolicy />} />
      <Route path="/shipping-policy" element={<ShippingPolicy/>}/>

      {/* User Profile Section with Nested Routes */}
      <Route
        path="/user"
        element={
          <PrivateRoutes>
            <UserProfile />
          </PrivateRoutes>
        }
      >
        <Route index element={<ProfileDetails />} />
        {/* Default route */}
        <Route path="profile" element={<ProfileDetails />} />
        <Route path="orders" element={<UserOrders />} />
        <Route path="storelocator_admin" element={<StoreLocator_Admin />} />
        {/* <Route path="pageaccess" element={<PagesAccess />} /> */}
      </Route>

      {/* Admin routes */}
      <Route path="/adminDashboard" element={<AdminDashboard />} />

      {/* for google auth */}
      <Route path="/auth-redirect" element={<AuthRedirect />} />
    </Routes>
  );
};

export default AllRoutes;
