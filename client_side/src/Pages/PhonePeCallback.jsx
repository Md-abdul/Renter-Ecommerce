// src/pages/PhonePeCallback.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PhonePeCallback = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [params, setParams] = useState({});
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    const obj = {};
    for (const [k, v] of new URLSearchParams(window.location.search)) {
      obj[k] = v;
    }
    setParams(obj);

    // Verify payment with backend
    verifyPayment(obj.merchantTransactionId);
  }, []);

  const verifyPayment = async (merchantTransactionId) => {
    if (!merchantTransactionId) {
      setVerificationStatus("failed");
      toast.error("Invalid payment transaction");
      return;
    }

    try {
      setVerificationStatus("verifying");

      const token = localStorage.getItem("token");
      if (!token) {
        setVerificationStatus("failed");
        toast.error("Please login to verify payment");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        // "http://localhost:5000/api/phonepe/verify",
        "https://renter-ecommerce.vercel.app/api/phonepe/verify",
        { merchantTransactionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setVerificationStatus("success");
        setVerificationResult(response.data);

        // Clear stored payment data
        localStorage.removeItem("pendingOrderId");
        localStorage.removeItem("merchantTransactionId");

        toast.success("Payment successful! Your order is being processed.");

        // Redirect to orders page after 3 seconds
        setTimeout(() => {
          navigate("/orders");
        }, 3000);
      } else {
        setVerificationStatus("failed");
        setVerificationResult(response.data);
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setVerificationStatus("failed");
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  const handleContinue = () => {
    if (verificationStatus === "success") {
      navigate("/orders");
    } else {
      navigate("/checkout");
    }
  };

  const renderStatusIcon = () => {
    switch (verificationStatus) {
      case "verifying":
        return <FiLoader className="text-blue-500 text-6xl animate-spin" />;
      case "success":
        return <FiCheckCircle className="text-green-500 text-6xl" />;
      case "failed":
        return <FiXCircle className="text-red-500 text-6xl" />;
      default:
        return <FiLoader className="text-blue-500 text-6xl animate-spin" />;
    }
  };

  const renderStatusMessage = () => {
    switch (verificationStatus) {
      case "verifying":
        return {
          title: "Verifying Payment...",
          message: "Please wait while we verify your payment with PhonePe.",
          color: "text-blue-600",
        };
      case "success":
        return {
          title: "Payment Successful!",
          message:
            "Your payment has been verified and your order is being processed.",
          color: "text-green-600",
        };
      case "failed":
        return {
          title: "Payment Failed",
          message:
            "Your payment could not be verified. Please try again or contact support.",
          color: "text-red-600",
        };
      default:
        return {
          title: "Processing...",
          message: "Please wait...",
          color: "text-blue-600",
        };
    }
  };

  const statusInfo = renderStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">{renderStatusIcon()}</div>

        <h2 className={`text-2xl font-bold mb-4 ${statusInfo.color}`}>
          {statusInfo.title}
        </h2>

        <p className="text-gray-600 mb-6">{statusInfo.message}</p>

        {verificationResult && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Transaction Details:</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Transaction ID:</span>{" "}
                {verificationResult.transactionId}
              </p>
              <p>
                <span className="font-medium">Order ID:</span>{" "}
                {verificationResult.orderId}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {verificationResult.paymentStatus}
              </p>
            </div>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              You will be redirected to your orders page automatically in a few
              seconds.
            </p>
          </div>
        )}

        <button
          onClick={handleContinue}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            verificationStatus === "success"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : verificationStatus === "failed"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={verificationStatus === "verifying"}
        >
          {verificationStatus === "success"
            ? "View Orders"
            : verificationStatus === "failed"
            ? "Try Again"
            : "Processing..."}
        </button>

        {verificationStatus === "verifying" && (
          <p className="text-sm text-gray-500 mt-4">
            This may take a few moments...
          </p>
        )}
      </div>
    </div>
  );
};

export default PhonePeCallback;
