import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();

  // Use local backend for development
  // const API_BASE_URL = "https://renter-ecommerce-1.onrender.com/api";
  const API_BASE_URL = "https://renter-ecommerce.vercel.app/api";

  // Calculate total price of items in cart
  // const getTotalPrice = () => {
  //   return cart.reduce((total, item) => {
  //     return total + (item.offerPrice || item.price) * item.quantity;
  //   }, 0);
  // };
  const getTotalPrice = () => {
    const subtotal = cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    if (!appliedCoupon) return Math.round(subtotal);

    const discountAmount = (subtotal * appliedCoupon.discountPercentage) / 100;
    const finalDiscount = Math.min(
      discountAmount,
      appliedCoupon.maxDiscountAmount
    );

    return Math.round(subtotal - finalDiscount);
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const discountAmount = (subtotal * appliedCoupon.discountPercentage) / 100;
    return Math.min(discountAmount, appliedCoupon.maxDiscountAmount);
  };

  // Fetch user's cart from server
  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cart/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData = response.data.cart;
      const cartArray = Object.values(cartData);
      setCart(cartArray);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []); //

  // Fetch user's orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Clear cart after order is placed
  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${API_BASE_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // const addToCart = async (product, quantity = 1) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       toast.error("Please log in to add products to your cart.");
  //       navigate("/login");
  //       return;
  //     }

  //     // Extract color and size from product
  //     const color = product.selectedColor; // Should be a string (e.g., "Red")
  //     const size = product.selectedSize;   // Should be a string (e.g., "M")

  //     if (!color || !size) {
  //       toast.error("Color and size are required.");
  //       return;
  //     }

  //     const response = await axios.post(
  //       `${API_BASE_URL}/cart/add`,
  //       {
  //         productId: product._id,
  //         quantity,
  //         color: color.toString(), // Ensure string
  //         size: size.toString(),   // Ensure string
  //       },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Product added to cart");
  //       await fetchCart(); // Refresh cart data
  //       return response.data.addedItem; // Use the renamed `addedItem` from backend
  //     }
  //   } catch (error) {
  //     console.error("Error adding to cart:", error);
  //     toast.error(error.response?.data?.message || "Failed to add to cart");
  //     throw error;
  //   }
  // };

  // Remove product from cart

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to add products to your cart.");
        navigate("/login");
        return;
      }

      // Extract color and size from product
      const color = product.selectedColor; // Should be a string (e.g., "Red")
      const size = product.selectedSize; // Should be a string (e.g., "M")

      if (!color || !size) {
        toast.error("Color and size are required.");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/cart/add`,
        {
          productId: product._id,
          quantity,
          color: color.toString(), // Ensure string
          size: size.toString(), // Ensure string
          price: product.basePrice, // Send the calculated price from SingleProductPage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success("Product added to cart");
        await fetchCart(); // Refresh cart data
        return response.data.addedItem; // Use the renamed `addedItem` from backend
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to modify your cart.");
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success("Product removed from cart");
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(error.response?.data?.message || "Failed to remove product");
    }
  };

  // Update product quantity in cart
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(itemId);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to modify your cart.");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/cart/update-quantity/${itemId}`,
        { newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const checkout = async (shippingDetails, paymentMethod) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to complete checkout.");
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      setLoading(true);

      // For other payment methods (card, cod, etc.)
      const order = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          shippingAddress: shippingDetails,
          paymentMethod: paymentMethod,
          couponCode: appliedCoupon?.couponCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (order.status === 201) {
        await clearCart();
        await fetchOrders();
        setAppliedCoupon(null);
        toast.success("Order placed successfully!");
        navigate("/orders");
        return order.data.order;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Checkout failed. Please try again."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleTokenError = () => {
    toast.error("Session expired. Please login again.");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const applyCoupon = async (couponCode) => {
    try {
      const token = localStorage.getItem("token"); // Use regular token for user actions
      if (!token) {
        toast.error("Please log in to apply coupon");
        navigate("/login");
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `https://renter-ecommerce.vercel.app/api/coupons/apply`,
        { couponCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.coupon) {
        setAppliedCoupon(response.data.coupon);
        toast.success("Coupon applied successfully");
        return response.data;
      }
    } catch (error) {
      console.error("Coupon application error:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const initiatePhonePePayment = async ({ shippingDetails, amount }) => {
    let orderId = null;
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!token || !userData) {
      toast.error("Please log in to complete payment");
      navigate("/login");
      return { success: false };
    }

    try {
      setLoading(true);

      // Step 1: Create a pending order
      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders/pending`,
        {
          shippingAddress: shippingDetails,
          paymentMethod: "phonepe",
          couponCode: appliedCoupon?.couponCode,
          items: cart,
          totalAmount: amount,
          userId: userData.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      orderId = orderResponse.data.order._id;
      localStorage.setItem("pendingOrderId", orderId);

      // Step 2: Initiate payment
      const paymentResponse = await axios.post(
        `${API_BASE_URL}/phonepe/payment`,
        {
          orderId,
          amount,
          userId: userData.userId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "8207473188",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || "Payment failed");
      }

      // Step 3: Redirect to payment page
      window.location.href = paymentResponse.data.paymentUrl;
      return { success: true };
    } catch (error) {
      console.error("Payment error:", error);

      // Rollback: Delete the pending order if payment failed
      if (orderId) {
        try {
          await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localStorage.removeItem("pendingOrderId");
        } catch (rollbackError) {
          console.error("Failed to rollback order:", rollbackError);
        }
      }

      toast.error(
        error.response?.data?.message || "Payment failed. Please try again."
      );
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Initialize cart and orders when component mounts
  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchCart();
      fetchOrders();
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        loading,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
        fetchOrders,
        getTotalPrice,
        getDiscountAmount,
        clearCart,
        checkout,
        applyCoupon,
        removeCoupon,
        initiatePhonePePayment,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
