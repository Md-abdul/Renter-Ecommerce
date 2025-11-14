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
  const API_BASE_URL = "http://localhost:5000/api";
  // const API_BASE_URL = "https://renter-ecommerce.vercel.app/api";

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

  // Replace the existing addToCart in CartContext.jsx with this
  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to add products to your cart.");
        navigate("/login");
        return;
      }

      // Read selected color/size from product object (ensure SingleProduct passes these)
      const color = product.selectedColor;
      const size = product.selectedSize;

      if (!color || !size) {
        toast.error("Color and size are required.");
        return;
      }

      // Safely compute price adjustments
      const base = Number(product.basePrice) || 0;
      const colorObj =
        (product.colors || []).find(
          (c) =>
            c.name &&
            c.name.toString().toLowerCase() === color.toString().toLowerCase()
        ) || {};
      const colorAdj = Number(colorObj.priceAdjustment) || 0;

      const sizeObj =
        (colorObj.sizes || []).find(
          (s) =>
            s.size &&
            s.size.toString().toLowerCase() === size.toString().toLowerCase()
        ) || {};
      const sizeAdj = Number(sizeObj.priceAdjustment) || 0;

      const originalPrice = base + colorAdj + sizeAdj;
      const discount = Number(product.discount) || 0;
      const finalPrice =
        discount > 0
          ? Math.round(originalPrice * (1 - discount / 100))
          : Math.round(originalPrice);

      const response = await axios.post(
        `${API_BASE_URL}/cart/add`,
        {
          productId: product._id,
          quantity,
          color: color.toString(),
          size: size.toString(),
          // include calculated price but server will recompute/override for safety
          price: finalPrice,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success("Product added to cart");
        await fetchCart(); // Refresh cart data to reflect server-side values
        return response.data.addedItem;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      setCart([]); // immediately clear local state so Navbar updates
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${API_BASE_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setCart((prevCart) => prevCart.filter((item) => item._id !== productId)); // update instantly

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to modify your cart.");
        return;
      }

      await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(error.response?.data?.message || "Failed to remove product");
      fetchCart(); // fallback in case local update failed
    }
  };

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
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to complete payment");
      navigate("/login");
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/phonepe/createOrder`,
        {
          shippingDetails,
          couponCode: appliedCoupon?.couponCode || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
        return { success: true };
      } else {
        toast.error("Payment initiation failed. Please try again.");
        return { success: false };
      }
    } catch (error) {
      console.error("PhonePe initiation error:", error);
      toast.error(error.response?.data?.message || "Payment initiation failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // In CartContext.jsx - Update the initiatePhonePePayment function
// const initiatePhonePePayment = async ({ shippingDetails, amount }) => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     toast.error("Please log in to complete payment");
//     navigate("/login");
//     return { success: false };
//   }

//   try {
//     setLoading(true);
//     const response = await axios.post(
//       `${API_BASE_URL}/phonepe/createOrder`,
//       {
//         shippingDetails,
//         couponCode: appliedCoupon?.couponCode || null,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("PhonePe response:", response.data); // Debug log

//     if (response.data.success && response.data.paymentUrl) {
//       // Redirect to PhonePe payment page
//       window.location.href = response.data.paymentUrl;
//       return { success: true };
//     } else {
//       toast.error("Payment initiation failed. Please try again.");
//       return { success: false };
//     }
//   } catch (error) {
//     console.error("PhonePe initiation error:", error);
//     toast.error(error.response?.data?.message || "Payment initiation failed");
//     return { success: false };
//   } finally {
//     setLoading(false);
//   }
// };

  const replaceCartWithItem = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to buy this product.");
        // Store the intended destination for redirect after login
        localStorage.setItem("intendedDestination", "/checkout");
        localStorage.setItem(
          "buyNowProduct",
          JSON.stringify({ product, quantity })
        );
        navigate("/login");
        return;
      }
      await clearCart();
      await addToCart(product, quantity);
    } catch (error) {
      // Error handling is already in addToCart/clearCart
    }
  };

  // New function to handle redirect after profile completion
  const handleRedirectAfterProfileCompletion = () => {
    const intendedDestination = localStorage.getItem("intendedDestination");
    const buyNowProduct = localStorage.getItem("buyNowProduct");

    console.log("Handling profile completion redirect:", {
      intendedDestination,
      buyNowProduct: !!buyNowProduct,
    });

    if (intendedDestination && buyNowProduct) {
      try {
        // Clear the stored data first
        localStorage.removeItem("intendedDestination");
        localStorage.removeItem("buyNowProduct");

        // Parse the stored product data
        const { product, quantity } = JSON.parse(buyNowProduct);
        console.log("Replacing cart with product:", product.title);

        // Replace cart with the product and redirect to checkout
        replaceCartWithItem(product, quantity)
          .then(() => {
            console.log("Cart replaced, navigating to:", intendedDestination);
            navigate(intendedDestination);
          })
          .catch((error) => {
            console.error("Error replacing cart:", error);
            toast.error("Failed to load product. Please try again.");
            navigate("/");
          });
      } catch (error) {
        console.error("Error parsing stored product data:", error);
        toast.error("Failed to load product data. Please try again.");
        navigate("/");
      }
    } else if (intendedDestination && !buyNowProduct) {
      // Just a regular redirect (not buy now flow)
      console.log("Regular redirect to:", intendedDestination);
      localStorage.removeItem("intendedDestination");
      navigate(intendedDestination);
    }
  };

  // In CartContext.jsx - Update the checkAndHandlePostLoginRedirect function
  const checkAndHandlePostLoginRedirect = () => {
    const intendedDestination = localStorage.getItem("intendedDestination");
    const buyNowProduct = localStorage.getItem("buyNowProduct");

    if (intendedDestination && buyNowProduct) {
      // Check if profile is complete
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get(`${API_BASE_URL}/user/userDetails`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const user = response.data.user;
            const isProfileComplete =
              user?.name &&
              user?.phoneNumber &&
              user?.address?.street &&
              user?.address?.city &&
              user?.address?.zipCode &&
              user?.address?.state;

            if (isProfileComplete) {
              // Profile is complete, proceed with redirect
              handleRedirectAfterProfileCompletion();
            } else {
              // Profile incomplete, redirect to profile page
              toast.info("Please complete your profile before checkout.");
              navigate("/user/profile");
            }
          })
          .catch((error) => {
            console.error("Error checking profile:", error);
            toast.error("Failed to verify profile. Please try again.");
            navigate("/");
          });
      }
    } else if (intendedDestination === "/checkout") {
      // Regular checkout flow (not buy now)
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get(`${API_BASE_URL}/user/userDetails`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const user = response.data.user;
            const isProfileComplete =
              user?.name &&
              user?.phoneNumber &&
              user?.address?.street &&
              user?.address?.city &&
              user?.address?.zipCode &&
              user?.address?.state;

            if (isProfileComplete) {
              // Profile is complete, redirect to checkout
              localStorage.removeItem("intendedDestination");
              navigate("/checkout");
            } else {
              // Profile incomplete, redirect to profile page
              toast.info("Please complete your profile before checkout.");
              navigate("/user/profile");
            }
          })
          .catch((error) => {
            console.error("Error checking profile:", error);
            toast.error("Failed to verify profile. Please try again.");
            navigate("/");
          });
      }
    } else if (intendedDestination) {
      // Just a regular redirect (not checkout flow)
      localStorage.removeItem("intendedDestination");
      navigate(intendedDestination);
    }
  };

  // Initialize cart and orders when component mounts
  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchCart();
      fetchOrders();
      // Check for post-login redirect
      checkAndHandlePostLoginRedirect();
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
        replaceCartWithItem,
        handleRedirectAfterProfileCompletion,
        checkAndHandlePostLoginRedirect,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
