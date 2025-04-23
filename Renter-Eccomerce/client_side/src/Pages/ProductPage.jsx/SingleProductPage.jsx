import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

const SingleProductPage = () => {
  const { _id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getTotalPrice } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const MAX_CART_TOTAL = 40000;

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
            setSelectedImage(data.colors[0].images.main);
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
    setSelectedImage(color.images.main);
    setSelectedSize(""); // Reset size selection
    setSelectedQuantity(1); // Reset quantity to default
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSelectedQuantity(1); // Reset quantity to default when size changes
  };

  const calculateFinalPrice = () => {
    if (!product || !selectedSize) return product?.basePrice || 0;
    const sizeObj = product.sizes.find((s) => s.size === selectedSize);
    return product.basePrice + (sizeObj?.priceAdjustment || 0);
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

    const finalPrice = calculateFinalPrice();
    const itemTotal = finalPrice * selectedQuantity;
    const newCartTotal = getTotalPrice() + itemTotal;

    if (newCartTotal > MAX_CART_TOTAL) {
      toast.error(`Cart total cannot exceed ₹${MAX_CART_TOTAL}`);
      return;
    }

    addToCart(
      {
        ...product,
        selectedColor: selectedColor.name,
        selectedSize,
        price: finalPrice,
        image: selectedColor.images.main,
      },
      selectedQuantity
    );

    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      toast.error("Please select color and size");
      return;
    }

    const finalPrice = calculateFinalPrice();
    addToCart(
      {
        ...product,
        selectedColor: selectedColor.name,
        selectedSize,
        price: finalPrice,
        image: selectedColor.images.main,
      },
      selectedQuantity
    );
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-8">Product not found</div>;
  }

  const finalPrice = calculateFinalPrice();
  const discountedPrice = finalPrice - finalPrice * (product.discount / 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Images Section */}
        <div className="lg:w-1/2">
          <div className="sticky top-4">
            <div className="mb-4 bg-gray-50 rounded-lg p-4 shadow-sm">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto py-2">
              {selectedColor?.images.gallery.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.title} ${index + 1}`}
                  className="w-16 h-16 object-cover rounded cursor-pointer border hover:border-gray-400"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-4">{product.summary}</p>

          <div className="flex items-center mb-6">
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
              <Star
                className="text-yellow-500 fill-yellow-500 mr-1"
                size={16}
              />
              <span className="font-medium">{product.rating}</span>
            </div>
            <span className="ml-2 text-gray-500 text-sm">
              ({product.reviews} reviews)
            </span>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                ₹{discountedPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="ml-3 text-xl text-gray-500 line-through">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  <span className="ml-3 text-lg font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Color</h3>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <div
                  key={color.name}
                  onClick={() => handleColorSelect(color)}
                  className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedColor?.name === color.name
                      ? "border-gray-900 scale-105 shadow-md"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={color.images.main}
                    alt={color.name}
                    className="w-full h-full object-cover"
                  />
                </div>
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
          {selectedColor && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes
                  .filter((size) => size.quantity > 0)
                  .map((sizeObj) => {
                    const sizePrice =
                      product.basePrice + sizeObj.priceAdjustment;
                    return (
                      <button
                        key={sizeObj._id}
                        onClick={() => handleSizeSelect(sizeObj.size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-all flex flex-col items-center ${
                          selectedSize === sizeObj.size
                            ? "bg-gray-900 text-white border-gray-900"
                            : "border-gray-200 hover:border-gray-900 text-gray-700"
                        }`}
                      >
                        <span>{sizeObj.size}</span>
                        <span className="text-xs mt-1">
                          +₹{sizeObj.priceAdjustment || 0}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {selectedSize && (
            <div className="mb-6">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                Quantity
              </h3>
              <select
                value={selectedQuantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value);
                  const maxAvailable = product.sizes.find(
                    (s) => s.size === selectedSize
                  )?.quantity;

                  if (newQuantity > maxAvailable) {
                    toast.error(`Only ${maxAvailable} available`);
                    return;
                  }
                  setSelectedQuantity(newQuantity);
                }}
                className="border border-gray-300 rounded px-4 py-2 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                {[
                  ...Array(
                    Math.min(
                      10,
                      product.sizes.find((s) => s.size === selectedSize)
                        ?.quantity || 1
                    )
                  ),
                ].map((num) => (
                  <option key={num + 1} value={num + 1}>
                    {num + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
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
