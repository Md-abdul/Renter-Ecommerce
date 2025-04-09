import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, X } from "lucide-react";
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

    // Check available quantity for selected size
    const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);
    if (!selectedSizeObj || selectedSizeObj.quantity < selectedQuantity) {
      toast.error("Selected quantity exceeds available stock");
      return;
    }

    const productToAdd = {
      ...product,
      selectedColor: selectedColor.name,
      selectedColorHex: selectedColor.hexCode,
      selectedSize,
      selectedQuantity,
      image: selectedColor.images[0].imageUrl,
      maxQuantity: selectedSizeObj.quantity, // Store max available quantity
    };

    addToCart(productToAdd, selectedQuantity);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
    <div className="container mx-auto px-6 py-12 flex gap-10 bg-gray-50 text-gray-900 rounded-xl p-8 mb-8">
      {/* Left Section: Images */}
      <div className="flex gap-4 w-1/2">
        <div className="flex flex-col gap-4">
          {selectedColor?.images[0]?.subImages.map((img, index) => (
            <img
              key={index}
              src={img.subImagesUrl}
              alt={`${product.title} view ${index + 1}`}
              className={`w-24 h-24 object-cover rounded-lg cursor-pointer shadow-md transition transform hover:scale-110 border-2 ${
                selectedImage === img.subImagesUrl
                  ? "border-yellow-500"
                  : "border-gray-400"
              }`}
              onClick={() => setSelectedImage(img.subImagesUrl)}
            />
          ))}
        </div>
        <div className="w-full rounded-lg overflow-hidden shadow-xl bg-white p-2 border border-gray-300">
          <img
            src={selectedImage}
            alt={product.title}
            className="w-full h-[500px] object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Right Section: Product Details */}
      <div className="w-1/2 flex flex-col justify-between bg-white p-6 rounded-lg">
        <div>
          <h1 className="text-4xl font-extrabold text-black mb-2">
            {product.title}
          </h1>
          <p className="text-gray-600 text-lg mb-4">{product.summary}</p>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Color</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedColor?.name === color.name
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
            </div>
            {selectedColor && (
              <p className="mt-2 text-gray-700">
                Selected: {selectedColor.name}
              </p>
            )}
          </div>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-500 text-lg mr-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={
                    i < Math.floor(product.rating)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-gray-500">({product.reviews} reviews)</span>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-black">
              ₹{product.offerPrice}
            </span>
            <span className="ml-3 text-2xl text-gray-500 line-through">
              ₹{product.price}
            </span>
            <span className="ml-3 text-xl text-red-500">
              ({product.discount}% OFF)
            </span>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Size</h3>
            <div className="flex gap-2 mb-4">
              {product.sizes
                .filter((size) => size.quantity > 0)
                .map((sizeObj) => (
                  <button
                    key={sizeObj.size}
                    onClick={() => handleSizeSelect(sizeObj.size)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedSize === sizeObj.size
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
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

          {/* Quantity Selection */}
          {selectedSize && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Quantity</h3>
              <div className="flex items-center gap-4">
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
                  className="border border-gray-300 rounded-lg px-4 py-2"
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
                <span className="text-gray-500">
                  {product.sizes.find((s) => s.size === selectedSize)?.quantity}{" "}
                  available
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-yellow-500 text-black px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition hover:bg-yellow-600 hover:scale-105 cursor-pointer"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition hover:bg-gray-900 hover:scale-105 cursor-pointer"
          >
            <Package size={20} />
            Buy Now
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <ShoppingCart size={20} />
          <span>Product added to cart!</span>
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 p-1 rounded-full hover:bg-green-600 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SingleProductPage;
