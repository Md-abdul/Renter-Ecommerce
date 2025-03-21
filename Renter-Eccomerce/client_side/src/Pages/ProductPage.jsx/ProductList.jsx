import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SortAsc, SortDesc, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Number of items per page
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(
      (product) =>
        product.category === category &&
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 w-[90%]">
      {/* Search and Sort Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative flex items-center">
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isSearchExpanded ? "w-64" : "w-0"
            }`}
          >
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="p-2 bg-yellow-400 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 ml-2"
          >
            <Search className="text-gray-900" size={20} />
          </button>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {sortOrder === "asc" ? (
            <>
              <SortAsc size={20} /> Price: Low to High
            </>
          ) : (
            <>
              <SortDesc size={20} /> Price: High to Low
            </>
          )}
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {currentProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="relative bg-white/70 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-2xl hover:shadow-3xl border border-gray-200/50"
          >
            {/* Product Image */}
            <div className="relative w-full h-72 overflow-hidden rounded-t-lg">
              <img
                src={product.image[0].imageUrl}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Quick View
              </button>
            </div>

            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md">
                {product.discount}% OFF
              </div>
            )}

            {/* Wishlist Button */}
            <button className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300">
              <Heart size={20} className="text-gray-600 hover:text-red-500" />
            </button>

            {/* Product Details */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {product.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.summary}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-yellow-600">
                    ₹{product.offerPrice}
                  </span>
                  {product.discount > 0 && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ₹{product.price}
                    </span>
                  )}
                </div>
              </div>
              {/* Rating */}
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.floor(product.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md shadow-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 text-sm font-medium ${
                currentPage === page
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
                  : "bg-white text-yellow-500 hover:bg-yellow-50"
              } border border-yellow-500 rounded-md mx-1 transition-all duration-300`}
            >
              {page}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-black text-white py-20 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-yellow-400">
            Stay in Style
          </h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get 10% off your first purchase plus
            stay up to date with the latest collections and exclusive offers.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg bg-zinc-800 text-white placeholder-zinc-400 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-300 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
