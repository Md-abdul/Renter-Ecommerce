import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import axios from "axios";

const PaymentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyPhonePePayment, fetchCart } = useCart();
  const API_BASE_URL = "https://renter-ecommerce.vercel.app/api";
  // const API_BASE_URL = "http://localhost:5000/api"

  useEffect(() => {
    const handlePaymentStatus = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const merchantTransactionId = params.get("merchantTransactionId");
        const code = params.get("code");
        const orderId = localStorage.getItem("pendingOrderId");

        if (!orderId) {
          toast.error("Order information not found");
          navigate("/orders");
          return;
        }

        if (code === "PAYMENT_SUCCESS" || code === "COMPLETED") {
          // First verify the payment
          await verifyPhonePePayment(merchantTransactionId, orderId);

          // Then complete the order
          await axios.post(
            `${API_BASE_URL}/orders/complete/${orderId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Clear the pending order ID
          localStorage.removeItem("pendingOrderId");
          await fetchCart(); // Refresh cart
          toast.success("Payment successful!");
          navigate("/order");
        } else {
          toast.error("Payment failed. Please try again.");
          // Clear the pending order ID
          localStorage.removeItem("pendingOrderId");
          navigate("/checkout");
        }
      } catch (error) {
        console.error("Payment status error:", error);
        toast.error(
          error.response?.data?.message || "Error processing payment status"
        );
        // Clear the pending order ID
        localStorage.removeItem("pendingOrderId");
        navigate("/checkout");
      }
    };

    handlePaymentStatus();
  }, [location, verifyPhonePePayment, navigate, fetchCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Processing Payment...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we verify your payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
