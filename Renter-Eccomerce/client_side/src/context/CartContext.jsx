import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      console.log("Fetching cart...");
      const response = await axios.get("http://localhost:5000/api/user/get-cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("Cart response:", response.data);

      const cartData = response.data.cart;
      const productIds = Object.keys(cartData);

      // Fetch details for each product in the cart
      const productDetails = await Promise.all(
        productIds.map(async (id) => {
          const productRes = await axios.get(`http://localhost:5000/api/products/${id}`);
          return { ...productRes.data, quantity: cartData[id] };
        })
      );

      setCart(productDetails);
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add product to cart
  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to add products to your cart.");
        return;
      }

      console.log("Adding product to cart:", product._id);

      const response = await axios.post(
        "http://localhost:5000/api/user/add-to-cart",
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Add to cart response:", response.data);

      if (response.status === 200) {
        toast.success("Product Added to Cart");
        fetchCart(); // Refresh cart
      } else {
        toast.error("Failed to add product to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error);
      toast.error("Not Able to add to the cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/remove-from-cart",
        { productId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/update-cart-quantity",
        { productId, quantity },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchCart();
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
