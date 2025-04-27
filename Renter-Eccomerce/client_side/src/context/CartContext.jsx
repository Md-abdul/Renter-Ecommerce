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
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000/api";

  // Calculate total price of items in cart
  // const getTotalPrice = () => {
  //   return cart.reduce((total, item) => {
  //     return total + (item.offerPrice || item.price) * item.quantity;
  //   }, 0);
  // };
  const getTotalPrice = () => {
    return Math.round(
      cart.reduce((total, item) => {
        return total + item.price * item.quantity; // Already using discounted price
      }, 0)
    );
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
          price: product.price, // Send the calculated price from SingleProductPage
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

  // Checkout function
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
      const response = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          shippingAddress: shippingDetails,
          paymentMethod: paymentMethod || "card",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        await clearCart();
        await fetchOrders();
        toast.success("Order placed successfully!");
        navigate("/orders");
        return response.data.order;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
      throw error;
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
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
        fetchOrders,
        getTotalPrice,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
