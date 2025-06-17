import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
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
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const MAX_CART_TOTAL = 40000;
  //https://renter-ecommerce-2.onrender.com/
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(
          "https://renter-ecommerce-2.onrender.com/api/products",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setRelatedProducts(data);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };
    fetchRelatedProducts();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `https://renter-ecommerce-2.onrender.com/api/products/${_id}`
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
        setLoading(false);
      }
    };
    fetchProduct();
  }, [_id]);

  useEffect(() => {
    if (product) {
      console.log("Product loaded:", product);
      console.log("Selected size:", selectedSize);
      if (selectedSize) {
        const sizeObj = product.sizes.find((s) => s.size === selectedSize);
      }
    }
  }, [product, selectedSize]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedImage(color.images.main);
    setSelectedSize("");
    setSelectedQuantity(1);
    setCurrentGalleryIndex(0);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSelectedQuantity(1);
  };

  const calculateFinalPrice = () => {
    if (!product) return product?.basePrice || 0;

    let price = product.basePrice;

    if (selectedColor) {
      price += selectedColor.priceAdjustment || 0;
    }

    if (selectedSize) {
      const sizeObj = product.sizes.find((s) => s.size === selectedSize);
      if (sizeObj) {
        price += sizeObj.priceAdjustment || 0;
      }
    }

    return price;
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
        selectedSize: selectedSize.toString(),
        price: discountedPrice,
        originalPrice: finalPrice,
        image: selectedColor.images.main,
      },
      selectedQuantity
    );

    // toast.success("Added to cart!");
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
        colorPriceAdjustment: selectedColor.priceAdjustment || 0,
        sizePriceAdjustment:
          product.sizes.find((s) => s.size === selectedSize)?.priceAdjustment ||
          0,
      },
      selectedQuantity
    );
    navigate("/checkout");
  };

  const nextGalleryImage = () => {
    if (selectedColor?.images.gallery?.length) {
      setCurrentGalleryIndex(
        (prev) => (prev + 1) % selectedColor.images.gallery.length
      );
      setSelectedImage(selectedColor.images.gallery[currentGalleryIndex]);
    }
  };

  const prevGalleryImage = () => {
    if (selectedColor?.images.gallery?.length) {
      setCurrentGalleryIndex(
        (prev) =>
          (prev - 1 + selectedColor.images.gallery.length) %
          selectedColor.images.gallery.length
      );
      setSelectedImage(selectedColor.images.gallery[currentGalleryIndex]);
    }
  };

  const incrementQuantity = () => {
    const maxAvailable =
      product.sizes.find((s) => s.size === selectedSize)?.quantity || 0;
    if (selectedQuantity < Math.min(10, maxAvailable)) {
      setSelectedQuantity((prev) => prev + 1);
    } else {
      toast.error(`Only ${maxAvailable} available`);
    }
  };

  const decrementQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      const maxAvailable =
        product.sizes.find((s) => s.size === selectedSize)?.quantity || 0;
      if (value <= Math.min(10, maxAvailable)) {
        setSelectedQuantity(value);
      } else {
        toast.error(`Only ${maxAvailable} available`);
      }
    }
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
  const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);
  const isOutOfStock = selectedSizeObj ? selectedSizeObj.quantity === 0 : false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* Images Section */}
        <div className="lg:w-1/2">
          <div className="flex flex-row-reverse lg:flex-row gap-4">
            {/* Thumbnail Gallery */}
            <div className="hidden lg:flex flex-col gap-2 w-20">
              {selectedColor?.images.gallery?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(img);
                    setCurrentGalleryIndex(index);
                  }}
                  className={`w-full aspect-square rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? "border-yellow-500 scale-105"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image with Navigation */}
            <div className="flex-1 relative">
              {/* // Main Image with Navigation */}
              <div className="flex-1 relative">
                <div className="bg-gray-50 rounded-xl p-4 shadow-sm aspect-square flex items-center justify-center relative">
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="w-full h-full max-h-[600px] object-contain"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center">
                      <span className="text-white font-bold text-xl bg-red-600 px-4 py-2 rounded-lg">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Mobile Gallery Navigation */}
              {selectedColor?.images.gallery?.length > 0 && (
                <div className="lg:hidden flex justify-between mt-4">
                  <button
                    onClick={prevGalleryImage}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="flex items-center gap-1">
                    {selectedColor.images.gallery.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          currentGalleryIndex === index
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextGalleryImage}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:w-1/2">
          <div className="sticky top-4 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
              <p className="text-gray-600 text-sm mb-4">{product.summary}</p>

              <div className="flex items-center mb-4">
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                  <Star
                    className="text-yellow-500 fill-yellow-500 mr-1"
                    size={16}
                  />
                  <span className="font-medium text-sm">{product.rating}</span>
                </div>
                <span className="ml-2 text-gray-500 text-sm">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{discountedPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{Math.round(finalPrice)}
                    </span>
                    <span className="ml-auto text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-base font-semibold mb-2">Select Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color._id}
                    onClick={() => handleColorSelect(color)}
                    className={`relative w-12 h-12 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedColor?._id === color._id
                        ? "border-gray-900 scale-105 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={color.images.main}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedColor?._id === color._id && (
                      <div className="absolute inset-0 bg-black/20"></div>
                    )}
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="mt-2 text-xs text-gray-600">
                  Selected:{" "}
                  <span className="font-medium">{selectedColor.name}</span>
                  {selectedColor.priceAdjustment > 0 && (
                    <span className="ml-1 text-yellow-600">
                      (+₹{selectedColor.priceAdjustment})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Size Selection */}
            {selectedColor && (
              <div>
                <h3 className="text-base font-semibold mb-2">Select Size</h3>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj._id}
                      onClick={() =>
                        !sizeObj.available
                          ? null
                          : handleSizeSelect(sizeObj.size)
                      }
                      className={`px-2 py-1.5 border rounded text-xs font-medium transition-all flex flex-col items-center ${
                        selectedSize === sizeObj.size
                          ? "bg-gray-900 text-white border-gray-900"
                          : sizeObj.available
                          ? "border-gray-200 hover:border-gray-900 text-gray-700"
                          : "border-gray-200 text-gray-400 cursor-not-allowed line-through"
                      }`}
                      disabled={!sizeObj.available}
                    >
                      <span>{sizeObj.size}</span>
                      {sizeObj.priceAdjustment > 0 && (
                        <span className="text-[10px] mt-0.5">
                          +₹{sizeObj.priceAdjustment}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {selectedSize && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    <button
                      onClick={decrementQuantity}
                      disabled={selectedQuantity <= 1}
                      className={`p-2 bg-gray-50 hover:bg-gray-100 transition-colors ${
                        selectedQuantity <= 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Minus size={16} className="text-gray-700" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={Math.min(10, selectedSizeObj?.quantity || 1)}
                      value={selectedQuantity}
                      onChange={handleQuantityChange}
                      className="w-12 px-0 py-2 border-0 text-center focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                    <button
                      onClick={incrementQuantity}
                      disabled={
                        selectedQuantity >=
                        Math.min(10, selectedSizeObj?.quantity || 1)
                      }
                      className={`p-2 bg-gray-50 hover:bg-gray-100 transition-colors ${
                        selectedQuantity >=
                        Math.min(10, selectedSizeObj?.quantity || 1)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Plus size={16} className="text-gray-700" />
                    </button>
                  </div>
                </div>

                {selectedQuantity >=
                  Math.min(10, selectedSizeObj?.quantity || 1) && (
                  <p className="text-xs text-yellow-600">
                    Maximum quantity reached
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={!selectedColor || !selectedSize || isOutOfStock}
                className={`flex items-center justify-center w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  !selectedColor || !selectedSize || isOutOfStock
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                <div className="flex items-center">
                  <ShoppingCart size={20} className="mr-2" />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                </div>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!selectedColor || !selectedSize || isOutOfStock}
                className={`flex items-center justify-center w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  !selectedColor || !selectedSize || isOutOfStock
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <div className="flex items-center">
                  <Package size={20} className="mr-2" />
                  <span>Buy Now</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">Product Description</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Highlights</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Premium quality materials for enhanced durability</li>
              <li>Ergonomic design for maximum comfort</li>
              <li>Modern and stylish appearance</li>
              <li>Easy to maintain and clean</li>
              <li>Environmentally friendly manufacturing process</li>
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-4">Specifications</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">General</h4>
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
                          Brand
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {product.brand || "Generic"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
                          Material
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Premium {product.material || "High-quality materials"}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
                          Dimensions
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          20 x 15 x 10 cm
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Detailed Description</h3>
            <div className="prose max-w-none text-gray-700">
              <p className="mb-4">
                This {product.title} is crafted with precision and attention to
                detail, offering both style and functionality. The product
                features a contemporary design that complements any setting,
                making it a versatile addition to your collection.
              </p>
              <p className="mb-4">
                Each piece undergoes rigorous quality checks to ensure
                durability and longevity. The materials used are carefully
                selected to provide the perfect balance between aesthetics and
                performance.
              </p>
              <p className="mb-4">
                The {product.title} comes in multiple color options to suit your
                personal style. Whether you prefer classic neutrals or bold
                statement colors, we have options to match your taste.
              </p>
              <h4 className="font-semibold mt-6 mb-2">Care Instructions</h4>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Wipe clean with a soft, damp cloth</li>
                <li>Avoid exposure to direct sunlight for extended periods</li>
                <li>Do not use harsh chemicals or abrasive cleaners</li>
                <li>Store in a dry place when not in use</li>
              </ul>
              <h4 className="font-semibold mt-6 mb-2">What's in the Box</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>1 x {product.title}</li>
                <li>Instruction manual</li>
                <li>Warranty card (1 year manufacturer warranty)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">
            Similar Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                className="bg-white rounded-lg overflow-hidden group border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={
                      product.colors[0]?.images.main ||
                      "https://via.placeholder.com/300"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-1 line-clamp-1">
                    {product.title}
                  </h4>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded">
                      <Star
                        className="text-yellow-500 fill-yellow-500 mr-1"
                        size={12}
                      />
                      <span className="font-medium text-xs">
                        {product.rating}
                      </span>
                    </div>
                    <span className="ml-2 text-gray-500 text-xs">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.basePrice}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹
                        {(
                          product.basePrice +
                          (product.sizes[0]?.priceAdjustment || 0)
                        ).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProductPage;
