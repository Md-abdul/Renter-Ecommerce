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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Sort Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-2.5 text-slate-500"
            size={20}
          />
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-md"
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
            className="relative bg-white rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl border border-slate-200"
          >
            {/* Product Image */}
            <div className="relative w-full h-72 overflow-hidden rounded-t-lg">
              <img
                src={product.image[0].imageUrl}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                {product.discount}% OFF
              </div>
            )}

            {/* Wishlist Button */}
            <button className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
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
                  <span className="text-lg font-bold text-teal-600">
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
                  ? "bg-teal-500 text-white"
                  : "bg-white text-teal-500 hover:bg-teal-50"
              } border border-teal-500 rounded-md mx-1 transition-colors`}
            >
              {page}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProductList;
