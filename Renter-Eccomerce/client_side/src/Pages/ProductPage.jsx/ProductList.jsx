import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SortAsc,
  SortDesc,
  Heart,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useProduct } from "../../context/ProductContext";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaSearch } from "react-icons/fa"; // Import Search Icon

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const sidebarRef = useRef(null);

  // Filter states
  const [wearCategoryFilter, setWearCategoryFilter] = useState([]);
  const [colorFilter, setColorFilter] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [availableColors, setAvailableColors] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState({
    wearCategory: true,
    colors: true,
    price: true,
    sort: true,
  });

  // Get all unique colors from products
  useEffect(() => {
    const colors = new Set();
    filteredProducts(category).forEach((product) => {
      product.colors.forEach((color) => {
        colors.add(color.name);
      });
    });
    setAvailableColors(Array.from(colors));
  }, [filteredProducts, category]);

  const calculateDisplayPrice = (product) => {
    const basePrice = product.basePrice;
    const sizeAdjustment = product.sizes[0]?.priceAdjustment || 0;
    const priceBeforeDiscount = basePrice + sizeAdjustment;

    if (product.discount > 0) {
      return Math.round(priceBeforeDiscount * (1 - product.discount / 100));
    }
    return priceBeforeDiscount;
  };

  // Apply filters and sorting
  const applyFiltersAndSorting = (products) => {
    let filtered = products.filter((product) => {
      // Wear category filter
      if (
        wearCategoryFilter.length > 0 &&
        !wearCategoryFilter.includes(product.wearCategory)
      ) {
        return false;
      }

      // Color filter
      if (
        colorFilter.length > 0 &&
        !product.colors.some((color) => colorFilter.includes(color.name))
      ) {
        return false;
      }

      // Price range filter
      const minPrice =
        product.basePrice +
        Math.min(...product.sizes.map((size) => size.priceAdjustment));
      const maxPrice =
        product.basePrice +
        Math.max(...product.sizes.map((size) => size.priceAdjustment));

      if (minPrice > priceRange[1] || maxPrice < priceRange[0]) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const priceA = calculateDisplayPrice(a);
      const priceB = calculateDisplayPrice(b);

      if (sortOrder === "asc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    return filtered;
  };

  // Pagination Logic
  const filteredAndSortedProducts = applyFiltersAndSorting(
    filteredProducts(category)
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductClick = (productId, e) => {
    e.preventDefault();
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const defaultColor = product.colors[0]?.name;
    const defaultSize = product.sizes[0]?.size;
    const defaultPrice =
      product.basePrice + (product.sizes[0]?.priceAdjustment || 0);

    addToCart(
      {
        ...product,
        price: defaultPrice,
        selectedColor: defaultColor,
        selectedSize: defaultSize,
      },
      1
    );

    // Animation feedback
    const button = e.target;
    button.classList.add("animate-ping");
    setTimeout(() => {
      button.classList.remove("animate-ping");
    }, 500);
  };

  const handleWearCategoryChange = (category) => {
    setWearCategoryFilter((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleColorChange = (color) => {
    setColorFilter((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const handlePriceChange = (index, value) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(value);
    setPriceRange(newPriceRange.sort((a, b) => a - b));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setWearCategoryFilter([]);
    setColorFilter([]);
    setPriceRange([0, 1000]);
    setCurrentPage(1);
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const ProductCard = ({ product }) => {
    const [ref, inView] = useInView({
      threshold: 0.1,
      triggerOnce: true,
    });

    const displayPrice = calculateDisplayPrice(product);
    const originalPrice =
      product.basePrice + (product.sizes[0]?.priceAdjustment || 0);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        onClick={(e) => handleProductClick(product._id, e)}
        className="relative bg-white rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
      >
        {/* Product Image */}
        <div className="relative w-full h-72 overflow-hidden rounded-t-lg group">
          <motion.img
            src={
              product.colors[0]?.images?.main ||
              "https://via.placeholder.com/500"
            }
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            whileHover={{ scale: 1.05 }}
          />
          <motion.button
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.05 }}
          >
            Quick View
          </motion.button>
        </div>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <motion.div
            className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {product.discount}% OFF
          </motion.div>
        )}

        {/* Wishlist Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            // Add wishlist functionality here
          }}
          className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            size={20}
            className="text-gray-600 hover:text-red-500 transition-colors"
          />
        </motion.button>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
            {product.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.summary}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-yellow-600">
                ₹{displayPrice}
              </span>
              {product.discount > 0 && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            <motion.button
              onClick={(e) => handleAddToCart(e, product)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile Filter Button */}
      <div className="md:hidden flex justify-end mb-6">
        <motion.button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-md"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter size={20} /> Filters
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <motion.div
          ref={sidebarRef}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block w-72 flex-shrink-0"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
              >
                Reset All
              </button>
            </div>
            {/* Wear Category Filter */}
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => toggleFilterSection("wearCategory")}
              >
                <h4 className="font-semibold text-gray-700">Wear Category</h4>
                {expandedFilters.wearCategory ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
              <AnimatePresence>
                {expandedFilters.wearCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {["top", "bottom"].map((cat) => (
                      <label key={cat} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={wearCategoryFilter.includes(cat)}
                          onChange={() => handleWearCategoryChange(cat)}
                          className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-600 capitalize">
                          {cat} wear
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Color Filter */}
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => toggleFilterSection("colors")}
              >
                <h4 className="font-semibold text-gray-700">Colors</h4>
                {expandedFilters.colors ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
              <AnimatePresence>
                {expandedFilters.colors && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {availableColors.map((color) => (
                        <div key={color} className="flex flex-col items-center">
                          <motion.button
                            onClick={() => handleColorChange(color)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              colorFilter.includes(color)
                                ? "border-yellow-500 scale-110"
                                : "border-gray-200"
                            } transition-all duration-200`}
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                            whileHover={{ scale: 1.1 }}
                          />
                          <span className="text-xs mt-1 text-gray-600 truncate w-full text-center">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Price Range Filter */}
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => toggleFilterSection("price")}
              >
                <h4 className="font-semibold text-gray-700">Price Range</h4>
                {expandedFilters.price ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
              <AnimatePresence>
                {expandedFilters.price && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        ₹{priceRange[0]}
                      </span>
                      <span className="text-sm text-gray-600">
                        ₹{priceRange[1]}+
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full ">
                      <div
                        className="absolute h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                        style={{
                          left: `${(priceRange[0] / 1000) * 100}%`,
                          right: `${100 - (priceRange[1] / 1000) * 100}%`,
                        }}
                      ></div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(0, e.target.value)}
                        className="absolute w-full h-2 opacity-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(1, e.target.value)}
                        className="absolute w-full h-2 opacity-0 cursor-pointer"
                      />
                      <div
                        className="absolute w-4 h-4 bg-yellow-500 rounded-full -top-1 transform -translate-x-1/2 shadow-md"
                        style={{ left: `${(priceRange[0] / 1000) * 100}%` }}
                      ></div>
                      <div
                        className="absolute w-4 h-4 bg-yellow-500 rounded-full -top-1 transform -translate-x-1/2 shadow-md"
                        style={{ left: `${(priceRange[1] / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* // Add this in the sidebar filters section (right after the price
            range filter) */}
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => toggleFilterSection("sort")}
              >
                <h4 className="font-semibold text-gray-700">Sort By</h4>
                {expandedFilters.sort ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
              <AnimatePresence>
                {expandedFilters.sort && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <button
                      onClick={() => setSortOrder("asc")}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                        sortOrder === "asc"
                          ? "bg-yellow-100 text-yellow-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <SortAsc size={16} /> Price: Low to High
                    </button>
                    <button
                      onClick={() => setSortOrder("desc")}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                        sortOrder === "desc"
                          ? "bg-yellow-100 text-yellow-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <SortDesc size={16} /> Price: High to Low
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Mobile Filter Sidebar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                </motion.div>

                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="inline-block align-bottom bg-white rounded-t-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        Filters
                      </h3>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="text-gray-400 hover:text-gray-500 p-1"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Wear Category Filter */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleFilterSection("wearCategory")}
                      >
                        <h4 className="font-semibold text-gray-700">
                          Wear Category
                        </h4>
                        {expandedFilters.wearCategory ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedFilters.wearCategory && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2 overflow-hidden"
                          >
                            {["top", "bottom"].map((cat) => (
                              <label key={cat} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={wearCategoryFilter.includes(cat)}
                                  onChange={() => handleWearCategoryChange(cat)}
                                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-gray-600 capitalize">
                                  {cat} wear
                                </span>
                              </label>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Color Filter */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleFilterSection("colors")}
                      >
                        <h4 className="font-semibold text-gray-700">Colors</h4>
                        {expandedFilters.colors ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedFilters.colors && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-5 gap-2">
                              {availableColors.map((color) => (
                                <div
                                  key={color}
                                  className="flex flex-col items-center"
                                >
                                  <button
                                    onClick={() => handleColorChange(color)}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                      colorFilter.includes(color)
                                        ? "border-yellow-500 scale-110"
                                        : "border-gray-200"
                                    } transition-all duration-200`}
                                    style={{
                                      backgroundColor: color.toLowerCase(),
                                    }}
                                    title={color}
                                  />
                                  <span className="text-xs mt-1 text-gray-600 truncate w-full text-center">
                                    {color}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleFilterSection("price")}
                      >
                        <h4 className="font-semibold text-gray-700">
                          Price Range
                        </h4>
                        {expandedFilters.price ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedFilters.price && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                ₹{priceRange[0]}
                              </span>
                              <span className="text-sm text-gray-600">
                                ₹{priceRange[1]}+
                              </span>
                            </div>
                            <div className="relative h-2 bg-gray-200 rounded-full">
                              <div
                                className="absolute h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                                style={{
                                  left: `${(priceRange[0] / 1000) * 100}%`,
                                  right: `${
                                    100 - (priceRange[1] / 1000) * 100
                                  }%`,
                                }}
                              ></div>
                              <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[0]}
                                onChange={(e) =>
                                  handlePriceChange(0, e.target.value)
                                }
                                className="absolute w-full h-2 opacity-0 cursor-pointer"
                              />
                              <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[1]}
                                onChange={(e) =>
                                  handlePriceChange(1, e.target.value)
                                }
                                className="absolute w-full h-2 opacity-0 cursor-pointer"
                              />
                              <div
                                className="absolute w-4 h-4 bg-yellow-500 rounded-full -top-1 transform -translate-x-1/2 shadow-md"
                                style={{
                                  left: `${(priceRange[0] / 1000) * 100}%`,
                                }}
                              ></div>
                              <div
                                className="absolute w-4 h-4 bg-yellow-500 rounded-full -top-1 transform -translate-x-1/2 shadow-md"
                                style={{
                                  left: `${(priceRange[1] / 1000) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* shorting filter */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleFilterSection("sort")}
                      >
                        <h4 className="font-semibold text-gray-700">Sort By</h4>
                        {expandedFilters.sort ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                      <AnimatePresence>
                        {expandedFilters.sort && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2 overflow-hidden"
                          >
                            <button
                              onClick={() => setSortOrder("asc")}
                              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                                sortOrder === "asc"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <SortAsc size={16} /> Price: Low to High
                            </button>
                            <button
                              onClick={() => setSortOrder("desc")}
                              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                                sortOrder === "desc"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <SortDesc size={16} /> Price: High to Low
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-yellow-500 text-base font-medium text-black hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply Filters
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reset
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Sort Section */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-end mb-8"
          >
            <div className="relative flex items-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "250px" }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Product Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-gray-600 font-medium"
          >
            Showing {currentProducts.length} of{" "}
            {filteredAndSortedProducts.length} products
          </motion.div>

          {/* Product Grid */}
          {currentProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="text-gray-500 text-lg mb-4">
                No products found matching your filters
              </div>
              <motion.button
                onClick={resetFilters}
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset Filters
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {currentProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-12"
            >
              <nav className="inline-flex rounded-md shadow-sm">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <motion.button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 text-sm font-medium ${
                        currentPage === page
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
                          : "bg-white text-yellow-500 hover:bg-yellow-50"
                      } border border-yellow-500 rounded-md mx-1 transition-all duration-300`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {page}
                    </motion.button>
                  )
                )}
              </nav>
            </motion.div>
          )}

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 mt-16 rounded-2xl overflow-hidden relative"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center"></div>
            <div className="container mx-auto px-4 text-center relative">
              <motion.h2
                className="text-4xl font-bold mb-4 text-yellow-400"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Stay in Style
              </motion.h2>
              <motion.p
                className="text-gray-300 mb-8 max-w-2xl mx-auto"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Subscribe to our newsletter and get 10% off your first purchase
                plus stay up to date with the latest collections and exclusive
                offers.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row max-w-md mx-auto gap-2"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                <motion.button
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
