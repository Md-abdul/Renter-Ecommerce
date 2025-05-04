import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
//https://renter-ecommerce-2.onrender.com/
//http://localhost:5000
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://renter-ecommerce-2.onrender.com/api/products");
        setProducts(response.data);
        console.log(response.data)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductById = (id) => {
    return products.find((product) => product._id === id);
  };

  const filteredProducts = (category) => {
    return products
      .filter(
        (product) =>
          product.category === category &&
          product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === "asc") {
          return a.price - b.price;
        }
        return b.price - a.price;
      });
  };

  const value = {
    products,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    filteredProducts,
    getProductById,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};
