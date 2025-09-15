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
  // const clearCart = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) return;

  //     await axios.delete(`${API_BASE_URL}/cart/clear`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     setCart([]);
  //   } catch (error) {
  //     console.error("Error clearing cart:", error);
  //   }
  // };

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

  // const removeFromCart = async (productId) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       toast.error("Please log in to modify your cart.");
  //       return;
  //     }

  //     const response = await axios.delete(
  //       `${API_BASE_URL}/cart/remove/${productId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Product removed from cart");
  //       await fetchCart();
  //     }
  //   } catch (error) {
  //     console.error("Error removing from cart:", error);
  //     toast.error(error.response?.data?.message || "Failed to remove product");
  //   }
  // };

  // Update product quantity in cart
  
  // In CartContext.jsx

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

  // New function to check if user should be redirected after login
  // const checkAndHandlePostLoginRedirect = () => {
  //   const intendedDestination = localStorage.getItem("intendedDestination");
  //   const buyNowProduct = localStorage.getItem("buyNowProduct");

  //   // console.log("Checking post-login redirect:", {
  //   //   intendedDestination,
  //   //   buyNowProduct: !!buyNowProduct,
  //   // });

  //   if (intendedDestination && buyNowProduct) {
  //     // Check if profile is complete
  //     const token = localStorage.getItem("token");
  //     if (token) {
  //       // console.log("Checking profile completeness...");
  //       // Fetch user profile to check completeness
  //       axios
  //         .get(`${API_BASE_URL}/user/userDetails`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         })
  //         .then((response) => {
  //           const user = response.data.user;
  //           const isProfileComplete =
  //             user?.name &&
  //             user?.phoneNumber &&
  //             user?.address?.street &&
  //             user?.address?.city &&
  //             user?.address?.zipCode &&
  //             user?.address?.state;

  //           console.log("Profile complete:", isProfileComplete);

  //           if (isProfileComplete) {
  //             // Profile is complete, proceed with redirect
  //             // console.log("Profile complete, handling redirect...");
  //             handleRedirectAfterProfileCompletion();
  //           } else {
  //             // Profile incomplete, redirect to profile page
  //             // console.log("Profile incomplete, redirecting to profile...");
  //             toast.error("Please complete your profile before checkout.");
  //             navigate("/user/profile");
  //           }
  //         })
  //         .catch((error) => {
  //           // console.error("Error checking profile:", error);
  //           toast.error("Failed to verify profile. Please try again.");
  //           // Clear stored data on error
  //           localStorage.removeItem("intendedDestination");
  //           localStorage.removeItem("buyNowProduct");
  //           navigate("/");
  //         });
  //     }
  //   } else if (intendedDestination && !buyNowProduct) {
  //     // Just a regular redirect (not buy now flow)
  //     // console.log("Regular redirect to:", intendedDestination);
  //     localStorage.removeItem("intendedDestination");
  //     navigate(intendedDestination);
  //   } else if (window.location.pathname === "/login") {
  //     navigate("/user/profile");
  //   }
  // };


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
