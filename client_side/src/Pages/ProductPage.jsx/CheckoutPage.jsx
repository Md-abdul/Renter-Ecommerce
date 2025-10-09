// import React, { useState, useEffect } from "react";
// import { useCart } from "../../context/CartContext";
// import { useNavigate } from "react-router-dom";
// import {
//   FiCheckCircle,
//   FiCreditCard,
//   FiTruck,
//   FiHome,
//   FiArrowLeft,
//   FiLock,
//   FiTag,
//   FiSmartphone,
//   FiUser,
// } from "react-icons/fi";
// import Modal from "react-modal";
// import { toast } from "react-toastify";
// import axios from "axios";

// // Payment card images
// const visaCard = "https://cdn-icons-png.flaticon.com/512/196/196578.png";
// const mastercard = "https://cdn-icons-png.flaticon.com/512/196/196561.png";
// const amexCard = "https://cdn-icons-png.flaticon.com/512/196/196548.png";
// const paypalLogo = "https://cdn-icons-png.flaticon.com/512/196/196566.png";
// const codIllustration =
//   "https://cdn-icons-png.flaticon.com/512/2553/2553159.png";

// Modal.setAppElement("#root");

// const CheckoutPage = () => {
//   const {
//     cart,
//     getTotalPrice,
//     getDiscountAmount,
//     checkout,
//     applyCoupon,
//     removeCoupon,
//     appliedCoupon,
//     loading: cartLoading,
//     initiatePhonePePayment,
//     replaceCartWithItem,
//   } = useCart();

//   const navigate = useNavigate();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [couponCode, setCouponCode] = useState("");
//   const [couponLoading, setCouponLoading] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);
//   const [profileComplete, setProfileComplete] = useState(false);
//   const [useProfileAddress, setUseProfileAddress] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     phoneNumber: "",
//     alternatePhone: "",
//     paymentMethod: "cod",
//     cardNumber: "",
//     cardName: "",
//     expiryDate: "",
//     cvv: "",
//   });

//   const [loading, setLoading] = useState(false);

//   // Update the useEffect where we fetch user profile
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate("/login");
//           return;
//         }

//         const response = await axios.get(
//           "https://renter-ecommerce.vercel.app/api/user/userDetails",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const user = response.data.user;
//         setUserProfile(user);

//         // Update profile check condition
//         const isComplete =
//           user?.name &&
//           user?.phoneNumber &&
//           user?.address?.street &&
//           user?.address?.city &&
//           user?.address?.zipCode &&
//           user?.address?.state;

//         setProfileComplete(!!isComplete);

//         // If profile is complete, pre-fill the form
//         if (isComplete) {
//           setFormData({
//             ...formData,
//             name: user.name || "",
//             address: user.address?.street || "",
//             city: user.address?.city || "",
//             state: user.address?.state || "",
//             zipCode: user.address?.zipCode || "",
//             phoneNumber: user.phoneNumber || "",
//             alternatePhone: user.address?.alternatePhone || "",
//           });
//           setUseProfileAddress(true);
//         }
//       } catch (error) {
//         console.error("Error fetching user profile:", error);
//       }
//     };

//     fetchUserProfile();
//   }, [navigate]);

//   // Add new useEffect to handle stored buyNowProduct data
//   useEffect(() => {
//     const handleStoredBuyNowProduct = async () => {
//       const buyNowProduct = localStorage.getItem("buyNowProduct");
//       const intendedDestination = localStorage.getItem("intendedDestination");

//       if (
//         buyNowProduct &&
//         intendedDestination === "/checkout" &&
//         cart.length === 0
//       ) {
//         try {
//           const { product, quantity } = JSON.parse(buyNowProduct);
//           await replaceCartWithItem(product, quantity);
//           // Clear the stored data after successful cart replacement
//           localStorage.removeItem("buyNowProduct");
//           localStorage.removeItem("intendedDestination");
//         } catch (error) {
//           console.error("Error handling stored buy now product:", error);
//           toast.error("Failed to load product. Please try again.");
//           navigate("/");
//         }
//       }
//     };

//     if (!cartLoading) {
//       handleStoredBuyNowProduct();
//     }
//   }, [cart, cartLoading, replaceCartWithItem, navigate]);

//   // Calculate subtotal
//   const subtotal = cart.reduce(
//     (total, item) => total + item.price * item.quantity,
//     0
//   );

//   const API_BASE_URL = "https://renter-ecommerce-1.onrender.com";
//   // Calculate discount amount
//   const discountAmount = appliedCoupon
//     ? Math.min(
//         (subtotal * appliedCoupon.discountPercentage) / 100,
//         appliedCoupon.maxDiscountAmount
//       )
//     : 0;

//   // Calculate total
//   const total = subtotal - discountAmount;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const formatCardNumber = (value) => {
//     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
//     const matches = v.match(/\d{4,16}/g);
//     const match = (matches && matches[0]) || "";
//     const parts = [];

//     for (let i = 0, len = match.length; i < len; i += 4) {
//       parts.push(match.substring(i, i + 4));
//     }

//     if (parts.length) {
//       return parts.join(" ");
//     } else {
//       return value;
//     }
//   };

//   const handleCardNumberChange = (e) => {
//     const formattedValue = formatCardNumber(e.target.value);
//     setFormData((prev) => ({
//       ...prev,
//       cardNumber: formattedValue,
//     }));
//   };

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const paymentStatus = urlParams.get("payment");
//     const orderId = urlParams.get("orderId");

//     if (paymentStatus && orderId) {
//       window.history.replaceState({}, document.title, window.location.pathname);

//       if (paymentStatus === "success") {
//         toast.success("Payment successful! Your order is being processed.");
//         navigate(`/orders/${orderId}`);
//       } else if (paymentStatus === "failed") {
//         toast.error("Payment failed. Please try again.");
//         navigate(`/checkout?orderId=${orderId}`);
//       }
//     }
//   }, []);

//   // Update fillFromProfile function
//   const fillFromProfile = () => {
//     if (!userProfile) return;

//     setFormData({
//       ...formData,
//       name: userProfile.name || "",
//       address: userProfile.address?.street || "",
//       city: userProfile.address?.city || "",
//       state: user.address?.state || "",
//       zipCode: userProfile.address?.zipCode || "",
//       phoneNumber: userProfile.phoneNumber || "",
//       alternatePhone: userProfile.address?.alternatePhone || "",
//     });
//     setUseProfileAddress(true);
//     toast.success("Shipping details filled from your profile");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formData.name ||
//       !formData.address ||
//       !formData.city ||
//       !formData.zipCode ||
//       !formData.phoneNumber
//     ) {
//       toast.error("Please fill all required shipping details");
//       return;
//     }

//     setLoading(true);

//     try {
//       const shippingDetails = {
//         name: formData.name,
//         address: {
//           street: formData.address,
//           city: formData.city,
//           zipCode: formData.zipCode,
//           state: formData.state, // Add state if you have it
//           alternatePhone: formData.alternatePhone || "",
//           addressType: "home", // Default or from form
//         },
//         phoneNumber: formData.phoneNumber,
//       };

//       if (formData.paymentMethod === "phonepe") {
//         await initiatePhonePePayment({
//           shippingDetails,
//           amount: total,
//         });
//         setLoading(false);
//         return;
//       }

//       if (formData.paymentMethod === "cod") {
//         const order = await checkout(shippingDetails, "cod");
//         if (order) {
//           navigate("/orders");
//         }
//         setLoading(false);
//         return;
//       }
//     } catch (error) {
//       console.error("Checkout failed:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     navigate("/orders");
//   };

//   const handleApplyCoupon = async (e) => {
//     e.preventDefault();
//     if (!couponCode.trim()) {
//       toast.error("Please enter a coupon code");
//       return;
//     }

//     setCouponLoading(true);
//     try {
//       await applyCoupon(couponCode);
//       setCouponCode("");
//     } catch (error) {
//       console.error("Error applying coupon:", error);
//     } finally {
//       setCouponLoading(false);
//     }
//   };

//   if (cart.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-16 text-center">
//         <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-8">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Your cart is empty
//           </h2>
//           <button
//             onClick={() => navigate("/")}
//             className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md w-full font-medium"
//           >
//             Continue Shopping
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Update the profile check condition to:
//   if (!profileComplete) {
//     localStorage.setItem("intendedDestination", "/checkout");
//     return (
//       <div className="container mx-auto px-4 py-16 text-center">
//         <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-8">
//           <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
//             <FiUser className="inline-block mr-2" />
//             Complete your profile to proceed with checkout
//           </div>
//           <h2 className="text-xl font-bold text-gray-800 mb-4">
//             Please complete your profile details first
//           </h2>
//           <p className="text-gray-600 mb-6">
//             We need your name, phone number, and address to process your order.
//           </p>
//           <button
//             onClick={() => navigate("/user/profile")}
//             className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md w-full font-medium mb-4"
//           >
//             Complete Profile
//           </button>
//           <button
//             onClick={() => navigate(-1)}
//             className="text-yellow-600 hover:text-yellow-700 font-medium"
//           >
//             Back to Cart
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-6xl">
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center text-yellow-600 hover:text-yellow-700 mb-6 transition-colors font-medium"
//       >
//         <FiArrowLeft className="mr-2" /> Back to Cart
//       </button>

//       <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
//         Checkout
//       </h1>

//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Left Section - Shipping & Payment */}
//         <div className="lg:w-2/3">
//           <form
//             onSubmit={handleSubmit}
//             className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100"
//           >
//             <div className="mb-8">
//               <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
//                 <div className="bg-yellow-100 p-2 rounded-full mr-3">
//                   <FiHome className="text-yellow-600" />
//                 </div>
//                 Shipping Information
//               </h2>

//               <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <FiUser className="text-yellow-600 mr-2" />
//                     <span className="font-medium">Your profile details</span>
//                   </div>
//                   {!useProfileAddress && (
//                     <button
//                       type="button"
//                       onClick={fillFromProfile}
//                       className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
//                     >
//                       Use my profile address
//                     </button>
//                   )}
//                   {useProfileAddress && (
//                     <div className="flex items-center">
//                       <span className="text-sm text-green-600 mr-2">
//                         Using profile address
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => setUseProfileAddress(false)}
//                         className="text-sm text-yellow-600 hover:text-yellow-700"
//                       >
//                         Edit
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 {/* {useProfileAddress && (
//                   <div className="mt-2 text-sm text-gray-600">
//                     <p>Name: {userProfile.name}</p>
//                     <p>Address: {userProfile.address?.street}</p>
//                     <p>City: {userProfile.address?.city}</p>
//                     <p>Zip Code: {userProfile.address?.zipCode}</p>
//                     <p>Phone: {userProfile.phoneNumber}</p>
//                     {userProfile.address?.alternatePhone && (
//                       <p>
//                         Alternate Phone: {userProfile.address.alternatePhone}
//                       </p>
//                     )}
//                   </div>
//                 )} */}
//                 {useProfileAddress && (
//                   <div className="mt-2 text-sm text-gray-600">
//                     <p>Name: {userProfile.name}</p>
//                     <p>Address: {userProfile.address?.street}</p>
//                     <p>City: {userProfile.address?.city}</p>
//                     <p>State: {userProfile.address?.state}</p>{" "}
//                     {/* ← Add this line */}
//                     <p>Zip Code: {userProfile.address?.zipCode}</p>
//                     <p>Phone: {userProfile.phoneNumber}</p>
//                     {userProfile.address?.alternatePhone && (
//                       <p>
//                         Alternate Phone: {userProfile.address.alternatePhone}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2 font-medium">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                     required
//                     placeholder="John Doe"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2 font-medium">
//                     Address
//                   </label>
//                   <input
//                     type="text"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                     required
//                     placeholder="123 Main St"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2 font-medium">
//                     City
//                   </label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                     required
//                     placeholder="New York"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2 font-medium">
//                     State
//                   </label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                     required
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2 font-medium">
//                     Zip Code
//                   </label>
//                   <input
//                     type="text"
//                     name="zipCode"
//                     value={formData.zipCode}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                     required
//                     placeholder="10001"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2 font-medium">
//                     Phone Number <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="tel"
//                     name="phoneNumber"
//                     value={formData.phoneNumber}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                     required
//                     placeholder="10-digit phone number"
//                     maxLength={10}
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2 font-medium">
//                     Alternate Phone (Optional)
//                   </label>
//                   <input
//                     type="tel"
//                     name="alternatePhone"
//                     value={formData.alternatePhone}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                     placeholder="10-digit alternate number"
//                     maxLength={10}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Coupon Section */}
//             <div className="mb-8">
//               <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
//                 <div className="bg-yellow-100 p-2 rounded-full mr-3">
//                   <FiTag className="text-yellow-600" />
//                 </div>
//                 Apply Coupon
//               </h2>
//               <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
//                 {appliedCoupon ? (
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-green-600 font-medium">
//                         Coupon Applied!
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         {appliedCoupon.couponCode} -{" "}
//                         {appliedCoupon.discountPercentage}% off
//                         {appliedCoupon.maxDiscountAmount && (
//                           <span> (Max ₹{appliedCoupon.maxDiscountAmount})</span>
//                         )}
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={removeCoupon}
//                       className="text-red-600 hover:text-red-800 text-sm font-medium"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex gap-4">
//                     <input
//                       type="text"
//                       value={couponCode}
//                       onChange={(e) =>
//                         setCouponCode(e.target.value.toUpperCase())
//                       }
//                       placeholder="Enter coupon code"
//                       className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
//                       disabled={couponLoading}
//                     />
//                     <button
//                       type="button"
//                       onClick={handleApplyCoupon}
//                       disabled={couponLoading || !couponCode.trim()}
//                       className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {couponLoading ? (
//                         <span className="flex items-center">
//                           <svg
//                             className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                             ></path>
//                           </svg>
//                           Applying...
//                         </span>
//                       ) : (
//                         "Apply"
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="mb-8">
//               <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
//                 <div className="bg-yellow-100 p-2 rounded-full mr-3">
//                   <FiCreditCard className="text-yellow-600" />
//                 </div>
//                 Payment Method
//               </h2>

//               <div className="space-y-4">
//                 {/* Cash on Delivery Option */}
//                 <div
//                   className={`border-2 rounded-xl overflow-hidden transition-all ${
//                     formData.paymentMethod === "cod"
//                       ? "border-yellow-400 shadow-md"
//                       : "border-gray-200"
//                   }`}
//                 >
//                   <label className="flex items-center p-4 cursor-pointer">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="cod"
//                       checked={formData.paymentMethod === "cod"}
//                       onChange={handleInputChange}
//                       className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300"
//                       required
//                     />
//                     <img
//                       src={codIllustration}
//                       alt="Cash on Delivery"
//                       className="h-8 ml-2"
//                     />
//                     <div className="ml-3">
//                       <div className="font-medium">Cash on Delivery</div>
//                       <div className="text-sm text-gray-500">
//                         Pay when you receive your order
//                       </div>
//                     </div>
//                   </label>
//                 </div>
//                 {/* PhonePe Option */}
//                 <div
//                   className={`border-2 rounded-xl overflow-hidden transition-all ${
//                     formData.paymentMethod === "phonepe"
//                       ? "border-yellow-400 shadow-md"
//                       : "border-gray-200"
//                   }`}
//                 >
//                   <label className="flex items-center p-4 cursor-pointer">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="phonepe"
//                       checked={formData.paymentMethod === "phonepe"}
//                       onChange={handleInputChange}
//                       className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300"
//                       required
//                     />
//                     <img
//                       src="https://upload.wikimedia.org/wikipedia/commons/f/f2/PhonePe_Logo.svg"
//                       alt="PhonePe"
//                       className="h-6 ml-2"
//                     />
//                     <div className="ml-3">
//                       <div className="font-medium">PhonePe</div>
//                       <div className="text-sm text-gray-500">
//                         Pay securely with UPI, cards, and wallets
//                       </div>
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md flex justify-center items-center font-medium text-lg ${
//                 loading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
//               }`}
//             >
//               {loading ? (
//                 <span className="flex items-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Preparing ...
//                 </span>
//               ) : (
//                 "Place Order"
//               )}
//             </button>
//           </form>
//         </div>

//         {/* Right Section - Order Summary */}
//         <div className="lg:w-1/3">
//           <div className="bg-white shadow-xl rounded-2xl p-6 sticky top-4 border border-gray-100">
//             <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
//               <div className="bg-yellow-100 p-2 rounded-full mr-3">
//                 <FiTruck className="text-yellow-600" />
//               </div>
//               Order Summary
//             </h2>

//             <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
//               {cart.map((item) => (
//                 <div
//                   key={item._id}
//                   className="flex justify-between items-center border-b pb-4"
//                 >
//                   <div className="flex items-center">
//                     <img
//                       src={item.image}
//                       alt={item.name}
//                       className="w-14 h-14 object-cover rounded-lg mr-3 border border-gray-200"
//                     />
//                     <div>
//                       <h3 className="font-medium text-gray-800">{item.name}</h3>
//                       <p className="text-sm text-gray-600">
//                         Qty: {item.quantity}
//                       </p>
//                     </div>
//                   </div>
//                   <p className="font-medium text-gray-800">
//                     ₹
//                     {Math.round(
//                       (item.offerPrice || item.price) * item.quantity
//                     )}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <div className="space-y-3 border-t pt-4">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Subtotal</span>
//                 <span className="font-medium">₹{Math.round(subtotal)}</span>
//               </div>
//               {appliedCoupon && (
//                 <div className="flex justify-between text-green-600">
//                   <span>Discount ({appliedCoupon.discountPercentage}%)</span>
//                   <span className="font-medium">-₹{discountAmount}</span>
//                 </div>
//               )}
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Shipping</span>
//                 <span className="font-medium text-green-600">Free</span>
//               </div>
//               <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
//                 <span className="text-gray-800">Total</span>
//                 <span className="text-gray-800">₹{Math.round(total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Order Confirmation Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={closeModal}
//         contentLabel="Order Confirmation"
//         className="modal"
//         overlayClassName="modal-overlay"
//       >
//         <div className="text-center p-8">
//           <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//             <FiCheckCircle className="text-green-500 text-4xl" />
//           </div>
//           <h2 className="text-2xl font-bold mb-3 text-gray-800">
//             Order Confirmed!
//           </h2>
//           <p className="text-gray-600 mb-4">
//             Your order{" "}
//             <span className="font-semibold text-gray-800">
//               #{orderDetails?.orderId?.slice(-6).toUpperCase()}
//             </span>{" "}
//             has been placed successfully.
//           </p>
//           <div className="bg-gray-50 rounded-lg p-4 mb-6">
//             <p className="text-lg font-semibold text-gray-800">
//               Total Amount:{" "}
//               <span className="text-yellow-600">₹{orderDetails?.amount}</span>
//             </p>
//           </div>
//           <button
//             onClick={closeModal}
//             className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md w-full font-medium"
//           >
//             View Orders
//           </button>
//         </div>
//       </Modal>

//       {/* Custom Modal Styles */}
//       <style jsx global>{`
//         .modal {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           right: auto;
//           bottom: auto;
//           margin-right: -50%;
//           transform: translate(-50%, -50%);
//           background: white;
//           padding: 0;
//           border-radius: 16px;
//           max-width: 450px;
//           width: 90%;
//           outline: none;
//           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
//             0 10px 10px -5px rgba(0, 0, 0, 0.04);
//           border: 1px solid rgba(0, 0, 0, 0.05);
//         }
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background-color: rgba(0, 0, 0, 0.5);
//           z-index: 1000;
//           backdrop-filter: blur(4px);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CheckoutPage;

import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiCreditCard,
  FiTruck,
  FiHome,
  FiArrowLeft,
  FiLock,
  FiTag,
  FiSmartphone,
  FiUser,
} from "react-icons/fi";
import Modal from "react-modal";
import { toast } from "react-toastify";
import axios from "axios";

// Payment card images
const visaCard = "https://cdn-icons-png.flaticon.com/512/196/196578.png";
const mastercard = "https://cdn-icons-png.flaticon.com/512/196/196561.png";
const amexCard = "https://cdn-icons-png.flaticon.com/512/196/196548.png";
const paypalLogo = "https://cdn-icons-png.flaticon.com/512/196/196566.png";
const codIllustration =
  "https://cdn-icons-png.flaticon.com/512/2553/2553159.png";

Modal.setAppElement("#root");

const CheckoutPage = () => {
  const {
    cart,
    getTotalPrice,
    getDiscountAmount,
    checkout,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    loading: cartLoading,
    initiatePhonePePayment,
    replaceCartWithItem,
  } = useCart();

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [useProfileAddress, setUseProfileAddress] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    alternatePhone: "",
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [loading, setLoading] = useState(false);

  // Update the useEffect where we fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          // "http://localhost:5000/api/user/userDetails",
          "https://renter-ecommerce.vercel.app/api/user/userDetails",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = response.data.user;
        setUserProfile(user);

        // Update profile check condition
        const isComplete =
          user?.name &&
          user?.phoneNumber &&
          user?.address?.street &&
          user?.address?.city &&
          user?.address?.zipCode &&
          user?.address?.state;

        setProfileComplete(!!isComplete);

        // If profile is complete, pre-fill the form
        if (isComplete) {
          setFormData({
            ...formData,
            name: user.name || "",
            address: user.address?.street || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            zipCode: user.address?.zipCode || "",
            phoneNumber: user.phoneNumber || "",
            alternatePhone: user.address?.alternatePhone || "",
          });
          setUseProfileAddress(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Add new useEffect to handle stored buyNowProduct data
  useEffect(() => {
    const handleStoredBuyNowProduct = async () => {
      const buyNowProduct = localStorage.getItem("buyNowProduct");
      const intendedDestination = localStorage.getItem("intendedDestination");

      if (
        buyNowProduct &&
        intendedDestination === "/checkout" &&
        cart.length === 0
      ) {
        try {
          const { product, quantity } = JSON.parse(buyNowProduct);
          await replaceCartWithItem(product, quantity);
          // Clear the stored data after successful cart replacement
          localStorage.removeItem("buyNowProduct");
          localStorage.removeItem("intendedDestination");
        } catch (error) {
          console.error("Error handling stored buy now product:", error);
          toast.error("Failed to load product. Please try again.");
          navigate("/");
        }
      }
    };

    if (!cartLoading) {
      handleStoredBuyNowProduct();
    }
  }, [cart, cartLoading, replaceCartWithItem, navigate]);

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const API_BASE_URL = "https://renter-ecommerce-1.onrender.com";
  // Calculate discount amount
  const discountAmount = appliedCoupon
    ? Math.min(
        (subtotal * appliedCoupon.discountPercentage) / 100,
        appliedCoupon.maxDiscountAmount
      )
    : 0;

  // Calculate total
  const total = subtotal - discountAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData((prev) => ({
      ...prev,
      cardNumber: formattedValue,
    }));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const orderId = urlParams.get("orderId");

    if (paymentStatus && orderId) {
      window.history.replaceState({}, document.title, window.location.pathname);

      if (paymentStatus === "success") {
        toast.success("Payment successful! Your order is being processed.");
        navigate(`/orders/${orderId}`);
      } else if (paymentStatus === "failed") {
        toast.error("Payment failed. Please try again.");
        navigate(`/checkout?orderId=${orderId}`);
      }
    }
  }, []);

  // Update fillFromProfile function
  const fillFromProfile = () => {
    if (!userProfile) return;

    setFormData({
      ...formData,
      name: userProfile.name || "",
      address: userProfile.address?.street || "",
      city: userProfile.address?.city || "",
      state: user.address?.state || "",
      zipCode: userProfile.address?.zipCode || "",
      phoneNumber: userProfile.phoneNumber || "",
      alternatePhone: userProfile.address?.alternatePhone || "",
    });
    setUseProfileAddress(true);
    toast.success("Shipping details filled from your profile");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.zipCode ||
      !formData.phoneNumber
    ) {
      toast.error("Please fill all required shipping details");
      return;
    }

    setLoading(true);

    try {
      const shippingDetails = {
        name: formData.name,
        address: {
          street: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          state: formData.state, // Add state if you have it
          alternatePhone: formData.alternatePhone || "",
          addressType: "home", // Default or from form
        },
        phoneNumber: formData.phoneNumber,
      };

      if (formData.paymentMethod === "phonepe") {
        await initiatePhonePePayment({
          shippingDetails,
          amount: total,
        });
        return;
      }

      if (formData.paymentMethod === "cod") {
        const order = await checkout(shippingDetails, "cod");
        if (order) {
          navigate("/orders");
        }
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/orders");
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode("");
    } catch (error) {
      console.error("Error applying coupon:", error);
    } finally {
      setCouponLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md w-full font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Update the profile check condition to:
  if (!profileComplete) {
    localStorage.setItem("intendedDestination", "/checkout");
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            <FiUser className="inline-block mr-2" />
            Complete your profile to proceed with checkout
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Please complete your profile details first
          </h2>
          <p className="text-gray-600 mb-6">
            We need your name, phone number, and address to process your order.
          </p>
          <button
            onClick={() => navigate("/user/profile")}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md w-full font-medium mb-4"
          >
            Complete Profile
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-yellow-600 hover:text-yellow-700 mb-6 transition-colors font-medium"
      >
        <FiArrowLeft className="mr-2" /> Back to Cart
      </button>

      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section - Shipping & Payment */}
        <div className="lg:w-2/3">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100"
          >
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <FiHome className="text-yellow-600" />
                </div>
                Shipping Information
              </h2>

              <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiUser className="text-yellow-600 mr-2" />
                    <span className="font-medium">Your profile details</span>
                  </div>
                  {!useProfileAddress && (
                    <button
                      type="button"
                      onClick={fillFromProfile}
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                    >
                      Use my profile address
                    </button>
                  )}
                  {useProfileAddress && (
                    <div className="flex items-center">
                      <span className="text-sm text-green-600 mr-2">
                        Using profile address
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseProfileAddress(false)}
                        className="text-sm text-yellow-600 hover:text-yellow-700"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                {/* {useProfileAddress && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Name: {userProfile.name}</p>
                    <p>Address: {userProfile.address?.street}</p>
                    <p>City: {userProfile.address?.city}</p>
                    <p>Zip Code: {userProfile.address?.zipCode}</p>
                    <p>Phone: {userProfile.phoneNumber}</p>
                    {userProfile.address?.alternatePhone && (
                      <p>
                        Alternate Phone: {userProfile.address.alternatePhone}
                      </p>
                    )}
                  </div>
                )} */}
                {useProfileAddress && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Name: {userProfile.name}</p>
                    <p>Address: {userProfile.address?.street}</p>
                    <p>City: {userProfile.address?.city}</p>
                    <p>State: {userProfile.address?.state}</p>{" "}
                    {/* ← Add this line */}
                    <p>Zip Code: {userProfile.address?.zipCode}</p>
                    <p>Phone: {userProfile.phoneNumber}</p>
                    {userProfile.address?.alternatePhone && (
                      <p>
                        Alternate Phone: {userProfile.address.alternatePhone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    required
                    placeholder="123 Main St"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    required
                    placeholder="New York"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    required
                    placeholder="10001"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    required
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Alternate Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="10-digit alternate number"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <FiTag className="text-yellow-600" />
                </div>
                Apply Coupon
              </h2>
              <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-medium">
                        Coupon Applied!
                      </p>
                      <p className="text-sm text-gray-600">
                        {appliedCoupon.couponCode} -{" "}
                        {appliedCoupon.discountPercentage}% off
                        {appliedCoupon.maxDiscountAmount && (
                          <span> (Max ₹{appliedCoupon.maxDiscountAmount})</span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter coupon code"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                      disabled={couponLoading}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Applying...
                        </span>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <FiCreditCard className="text-yellow-600" />
                </div>
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* Cash on Delivery Option */}
                <div
                  className={`border-2 rounded-xl overflow-hidden transition-all ${
                    formData.paymentMethod === "cod"
                      ? "border-yellow-400 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <label className="flex items-center p-4 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                      required
                    />
                    <img
                      src={codIllustration}
                      alt="Cash on Delivery"
                      className="h-8 ml-2"
                    />
                    <div className="ml-3">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">
                        Pay when you receive your order
                      </div>
                    </div>
                  </label>
                </div>

                {/* PhonePe Option */}
                <div
                  className={`border-2 rounded-xl overflow-hidden transition-all ${
                    formData.paymentMethod === "phonepe"
                      ? "border-yellow-400 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <label className="flex items-center p-4 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="phonepe"
                      checked={formData.paymentMethod === "phonepe"}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                      required
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/5/56/PhonePe_Logo.png"
                      alt="PhonePe"
                      className="h-8 ml-2"
                    />
                    <div className="ml-3">
                      <div className="font-medium">PhonePe</div>
                      <div className="text-sm text-gray-500">
                        Pay securely using PhonePe UPI or wallet.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md flex justify-center items-center font-medium text-lg ${
                loading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Preparing ...
                </span>
              ) : (
                "Place Order"
              )}
            </button>
          </form>
        </div>

        {/* Right Section - Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white shadow-xl rounded-2xl p-6 sticky top-4 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <FiTruck className="text-yellow-600" />
              </div>
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center border-b pb-4"
                >
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg mr-3 border border-gray-200"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-800">
                    ₹
                    {Math.round(
                      (item.offerPrice || item.price) * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{Math.round(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                  <span className="font-medium">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">₹{Math.round(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Order Confirmation"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="text-center p-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 mb-4">
            Your order{" "}
            <span className="font-semibold text-gray-800">
              #{orderDetails?.orderId?.slice(-6).toUpperCase()}
            </span>{" "}
            has been placed successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-lg font-semibold text-gray-800">
              Total Amount:{" "}
              <span className="text-yellow-600">₹{orderDetails?.amount}</span>
            </p>
          </div>
          <button
            onClick={closeModal}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md w-full font-medium"
          >
            View Orders
          </button>
        </div>
      </Modal>

      {/* Custom Modal Styles */}
      <style jsx global>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          margin-right: -50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 0;
          border-radius: 16px;
          max-width: 450px;
          width: 90%;
          outline: none;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
