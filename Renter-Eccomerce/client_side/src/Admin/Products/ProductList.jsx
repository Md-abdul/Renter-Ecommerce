import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useProduct } from "../../context/ProductContext";

const ProductList = ({ category }) => {
  const {
    filteredProducts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
  } = useProduct();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts(category).slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(
    filteredProducts(category).length / itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const defaultColor = product.colors[0]?.name;
    const defaultSize = product.sizes[0]?.size;
    addToCart(product, 1, defaultColor, defaultSize);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg font-light">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Premium Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-wide">
          {category ? `${category} Collection` : "Luxury Collection"}
        </h1>
        <p className="text-gray-500 font-light max-w-2xl mx-auto">
          Discover our curated selection of premium products crafted with
          exceptional quality
        </p>
      </div>

      {/* Premium Search and Sort Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="relative w-full md:w-auto">
          <div
            className={`relative transition-all duration-500 ease-in-out ${
              isSearchExpanded ? "w-full md:w-96" : "w-12"
            }`}
          >
            <input
              type="text"
              placeholder="Search our collection..."
              className={`w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 shadow-sm transition-all duration-300 ${
                isSearchExpanded ? "opacity-100" : "absolute opacity-0"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`absolute left-0 top-0 p-3 rounded-full ${
                isSearchExpanded
                  ? "text-gold-500"
                  : "bg-white text-gray-500 hover:text-gold-500"
              } transition-all duration-300`}
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-light uppercase tracking-wider">
            Sort By:
          </span>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-gold-500 hover:text-gold-500 transition-all duration-300"
          >
            {sortOrder === "asc" ? (
              <>
                <ChevronUp size={18} />
                <span className="text-sm font-light">Price (Low to High)</span>
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                <span className="text-sm font-light">Price (High to Low)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Luxury Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {currentProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl border border-gray-100 hover:border-gold-100"
          >
            {/* Product Image */}
            <div className="relative w-full aspect-square overflow-hidden">
              <img
                src={
                  product.colors[0]?.images[0]?.imageUrl ||
                  "https://via.placeholder.com/500"
                }
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100">
                <button className="bg-white text-gray-800 px-6 py-2 rounded-full font-light text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  Quick View
                </button>
              </div>

              {/* Discount Badge */}
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  {product.discount}% OFF
                </div>
              )}

              {/* Wishlist Button */}
              <button
                className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart
                  size={20}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-5">
              <h3 className="text-lg font-light text-gray-900 mb-2 tracking-wide">
                {product.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 font-light">
                {product.summary}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.rating)
                          ? "text-gold-500 fill-gold-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-xs text-gray-400 font-light">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* Price and Add to Cart */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xl font-light text-gray-900">
                    ₹{product.offerPrice || product.price}
                  </span>
                  {product.offerPrice && product.offerPrice < product.price && (
                    <span className="ml-2 text-sm text-gray-400 line-through font-light">
                      ₹{product.price}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="bg-white border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white p-2 rounded-full transition-all duration-300"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Luxury Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-16">
          <nav className="inline-flex rounded-full shadow-sm border border-gray-200 p-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 flex items-center justify-center text-sm font-light ${
                  currentPage === page
                    ? "bg-gold-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                } rounded-full mx-1 transition-all duration-300`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Premium Newsletter Section */}
      <div className="bg-gray-900 text-white py-20 mt-16 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-gold-500/5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-light mb-4 tracking-wide">
            Stay in Style
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Subscribe to our newsletter and receive 10% off your first purchase,
            plus exclusive access to new collections and private events.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 font-light"
            />
            <button className="bg-gold-500 text-gray-900 px-6 py-3 rounded-full font-light hover:bg-gold-400 transition-colors shadow-md">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-light">
            By subscribing, you agree to our Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
