import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, X, ChevronRight, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

const SingleProductPage = () => {
  const { _id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, getTotalPrice } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const MAX_CART_TOTAL = 40000; // Maximum cart total limit in rupees

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${_id}`
        );
        const data = await response.json();
        if (data) {
          setProduct(data);
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0]);
            setSelectedImage(data.colors[0].images[0].imageUrl);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [_id]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedImage(color.images[0].imageUrl);
    setSelectedSize(""); // Reset size when color changes
  };

  const handleSizeSelect = (selectedSize) => {
    setSelectedSize(selectedSize.trim());
    setSelectedQuantity(1); // Reset quantity when size changes
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Check if adding this item would exceed the cart total limit
    const itemTotal = (product.offerPrice || product.price) * selectedQuantity;
    const newCartTotal = getTotalPrice() + itemTotal;

    if (newCartTotal > MAX_CART_TOTAL) {
      toast.error(`Cart total cannot exceed ₹${MAX_CART_TOTAL}`);
      return;
    }

    // Call addToCart with the correct parameters
    addToCart(product, selectedQuantity, selectedColor.name, selectedSize);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const productToAdd = {
      ...product,
      selectedColor: selectedColor.name,
      selectedColorHex: selectedColor.hexCode,
      selectedSize,
      selectedQuantity,
      image: selectedColor.images[0].imageUrl,
    };

    addToCart(productToAdd, selectedQuantity);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span className="hover:text-yellow-600 cursor-pointer">Home</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="hover:text-yellow-600 cursor-pointer">Products</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-700 font-medium">{product.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-xl p-6 shadow-sm">
        {/* Left Section: Images */}
        <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 order-2 md:order-1">
            {selectedColor?.images[0]?.subImages.map((img, index) => (
              <div
                key={index}
                className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedImage === img.subImagesUrl
                    ? "ring-2 ring-yellow-500"
                    : "hover:ring-1 ring-gray-200"
                }`}
                onClick={() => setSelectedImage(img.subImagesUrl)}
              >
                <img
                  src={img.subImagesUrl}
                  alt={`${product.title} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 order-1 md:order-2 bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-auto max-h-[500px] object-contain p-4"
            />
          </div>
        </div>

        {/* Right Section: Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>
            <p className="text-gray-600 mb-4">{product.summary}</p>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                <Star
                  size={16}
                  className="text-yellow-500 fill-yellow-500 mr-1"
                />
                <span className="font-medium text-gray-800">
                  {product.rating}
                </span>
              </div>
              <span className="ml-2 text-gray-500 text-sm">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{product.offerPrice}
                </span>
                <span className="ml-3 text-xl text-gray-500 line-through">
                  ₹{product.price}
                </span>
                <span className="ml-3 text-lg font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Select Color
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor?.name === color.name
                        ? "border-gray-900 scale-110"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected:{" "}
                  <span className="font-medium">{selectedColor.name}</span>
                </p>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Select Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes
                  .filter((size) => size.quantity > 0)
                  .map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      onClick={() => handleSizeSelect(sizeObj.size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                        selectedSize === sizeObj.size
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-200 hover:border-gray-900 text-gray-700"
                      } ${
                        sizeObj.quantity === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={sizeObj.quantity === 0}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
              </div>
            </div>

            {/* Premium Quantity Selector */}
            {selectedSize && (
              <div className="mb-10">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4 font-medium">
                  Quantity
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <select
                      value={selectedQuantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        const maxAvailable =
                          product.sizes.find((s) => s.size === selectedSize)
                            ?.quantity || 1;

                        if (newQuantity > maxAvailable) {
                          toast.error(
                            `Maximum available quantity is ${maxAvailable}`
                          );
                          return;
                        }

                        setSelectedQuantity(newQuantity);
                      }}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-6 py-3 pr-10 text-gray-700 focus:ring-2 focus:ring-gold-300 focus:border-gold-300 outline-none transition-all duration-300 cursor-pointer"
                    >
                      {[
                        ...Array(
                          Math.min(
                            10,
                            product.sizes.find((s) => s.size === selectedSize)
                              ?.quantity || 1
                          )
                        ).keys(),
                      ].map((num) => (
                        <option key={num + 1} value={num + 1}>
                          {num + 1}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-all hover:shadow-md"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-all hover:shadow-md"
            >
              <Package size={20} />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
