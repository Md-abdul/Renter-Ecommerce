import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://www.ranterstore.in/api/products"
        );
        setProducts(response.data);
        // console.log(response.data)
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

  // Helper to calculate display price (same as in ProductList)
  const calculateDisplayPrice = (product) => {
    const basePrice = product.basePrice;
    const sizeAdjustment =
      product.sizes && product.sizes.length > 0
        ? typeof product.sizes[0].priceAdjustment === "number"
          ? product.sizes[0].priceAdjustment
          : 0
        : 0;
    const priceBeforeDiscount = basePrice + sizeAdjustment;
    if (product.discount > 0) {
      return Math.round(priceBeforeDiscount * (1 - product.discount / 100));
    }
    return priceBeforeDiscount;
  };

  const filteredProducts = (category) => {
    return products
      .filter(
        (product) =>
          product.category === category &&
          product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const priceA = calculateDisplayPrice(a);
        const priceB = calculateDisplayPrice(b);
        if (sortOrder === "asc") {
          return priceA - priceB;
        }
        return priceB - priceA;
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
