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

  useEffect(() => {
    if (product) {
      console.log("Product loaded:", product);
      console.log("Selected size:", selectedSize);
      if (selectedSize) {
        const sizeObj = product.sizes.find((s) => s.size === selectedSize);
        console.log("Size object:", sizeObj);
        console.log("Available quantity:", sizeObj?.quantity);
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
      <div className="flex flex-col lg:flex-row gap-8">
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

                  {selectedSizeObj && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">
                        {selectedSizeObj.quantity}
                      </span>{" "}
                      available
                    </div>
                  )}
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
    </div>
  );
};

export default SingleProductPage;

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ShoppingCart,
//   Package,
//   Star,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Minus,
// } from "lucide-react";
// import { useCart } from "../../context/CartContext";
// import { toast } from "react-toastify";

// const SingleProductPage = () => {
//   const { _id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart, getTotalPrice } = useCart();
//   const [product, setProduct] = useState(null);
//   const [selectedImage, setSelectedImage] = useState("");
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedQuantity, setSelectedQuantity] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
//   const MAX_CART_TOTAL = 40000;

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:5000/api/products/${_id}`
//         );
//         const data = await response.json();
//         if (data) {
//           setProduct(data);
//           if (data.colors && data.colors.length > 0) {
//             setSelectedColor(data.colors[0]);
//             setSelectedImage(data.colors[0].images.main);
//           }
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching product:", error);
//         setLoading(false);
//       }
//     };
//     fetchProduct();
//   }, [_id]);

//   const handleColorSelect = (color) => {
//     setSelectedColor(color);
//     setSelectedImage(color.images.main);
//     setSelectedSize("");
//     setSelectedQuantity(1);
//     setCurrentGalleryIndex(0);
//   };

//   const handleSizeSelect = (size) => {
//     setSelectedSize(size);
//     setSelectedQuantity(1);
//   };

//   const calculateFinalPrice = () => {
//     if (!product) return product?.basePrice || 0;

//     let price = product.basePrice;

//     if (selectedColor) {
//       price += selectedColor.priceAdjustment || 0;
//     }

//     if (selectedSize) {
//       const sizeObj = product.sizes.find((s) => s.size === selectedSize);
//       if (sizeObj) {
//         price += sizeObj.priceAdjustment || 0;
//       }
//     }

//     return price;
//   };

//   const handleAddToCart = () => {
//     if (!selectedColor) {
//       toast.error("Please select a color");
//       return;
//     }
//     if (!selectedSize) {
//       toast.error("Please select a size");
//       return;
//     }

//     const finalPrice = calculateFinalPrice();
//     const itemTotal = finalPrice * selectedQuantity;
//     const newCartTotal = getTotalPrice() + itemTotal;

//     if (newCartTotal > MAX_CART_TOTAL) {
//       toast.error(`Cart total cannot exceed ₹${MAX_CART_TOTAL}`);
//       return;
//     }

//     addToCart(
//       {
//         ...product,
//         selectedColor: selectedColor.name,
//         selectedSize: selectedSize.toString(),
//         price: discountedPrice,
//         originalPrice: finalPrice,
//         image: selectedColor.images.main,
//       },
//       selectedQuantity
//     );

//     toast.success("Added to cart!");
//   };

//   const handleBuyNow = () => {
//     if (!selectedColor || !selectedSize) {
//       toast.error("Please select color and size");
//       return;
//     }

//     const finalPrice = calculateFinalPrice();
//     addToCart(
//       {
//         ...product,
//         selectedColor: selectedColor.name,
//         selectedSize,
//         price: finalPrice,
//         image: selectedColor.images.main,
//         colorPriceAdjustment: selectedColor.priceAdjustment || 0,
//         sizePriceAdjustment:
//           product.sizes.find((s) => s.size === selectedSize)?.priceAdjustment ||
//           0,
//       },
//       selectedQuantity
//     );
//     navigate("/checkout");
//   };

//   const nextGalleryImage = () => {
//     if (selectedColor?.images.gallery?.length) {
//       setCurrentGalleryIndex(
//         (prev) => (prev + 1) % selectedColor.images.gallery.length
//       );
//       setSelectedImage(selectedColor.images.gallery[currentGalleryIndex]);
//     }
//   };

//   const prevGalleryImage = () => {
//     if (selectedColor?.images.gallery?.length) {
//       setCurrentGalleryIndex(
//         (prev) =>
//           (prev - 1 + selectedColor.images.gallery.length) %
//           selectedColor.images.gallery.length
//       );
//       setSelectedImage(selectedColor.images.gallery[currentGalleryIndex]);
//     }
//   };

//   const incrementQuantity = () => {
//     const maxAvailable = product.sizes.find(
//       (s) => s.size === selectedSize
//     )?.quantity;
//     if (selectedQuantity < maxAvailable) {
//       setSelectedQuantity(selectedQuantity + 1);
//     } else {
//       toast.error(`Only ${maxAvailable} available`);
//     }
//   };

//   const decrementQuantity = () => {
//     if (selectedQuantity > 1) {
//       setSelectedQuantity(selectedQuantity - 1);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return <div className="text-center py-8">Product not found</div>;
//   }

//   const finalPrice = calculateFinalPrice();
//   const discountedPrice = finalPrice - finalPrice * (product.discount / 100);
//   const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);
//   const isOutOfStock = selectedSizeObj?.quantity === 0;

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       <div className="flex flex-col lg:flex-row gap-12">
//         {/* Images Section */}
//         <div className="lg:w-1/2">
//           <div className="flex flex-row-reverse lg:flex-row gap-4">
//             {/* Thumbnail Gallery */}
//             <div className="hidden lg:flex flex-col gap-2 w-20">
//               {selectedColor?.images.gallery?.map((img, index) => (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     setSelectedImage(img);
//                     setCurrentGalleryIndex(index);
//                   }}
//                   className={`w-full aspect-square rounded-md overflow-hidden border-2 transition-all ${
//                     selectedImage === img
//                       ? "border-yellow-500 scale-105"
//                       : "border-gray-200 hover:border-gray-400"
//                   }`}
//                 >
//                   <img
//                     src={img}
//                     alt={`${product.title} ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </button>
//               ))}
//             </div>

//             {/* Main Image with Navigation */}
//             <div className="flex-1 relative">
//               <div className="relative bg-gray-50 rounded-xl p-4 shadow-sm aspect-square flex items-center justify-center">
//                 <img
//                   src={selectedImage}
//                   alt={product.title}
//                   className="w-full h-full max-h-[600px] object-contain"
//                 />
//                 {isOutOfStock && (
//                   <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
//                     <span className="bg-white px-4 py-2 rounded-lg font-bold text-red-600">
//                       Out of Stock
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Mobile Gallery Navigation */}
//               {selectedColor?.images.gallery?.length > 0 && (
//                 <div className="lg:hidden flex justify-between mt-4">
//                   <button
//                     onClick={prevGalleryImage}
//                     className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
//                   >
//                     <ChevronLeft size={24} />
//                   </button>
//                   <div className="flex items-center gap-1">
//                     {selectedColor.images.gallery.map((_, index) => (
//                       <div
//                         key={index}
//                         className={`w-2 h-2 rounded-full ${
//                           currentGalleryIndex === index
//                             ? "bg-yellow-500"
//                             : "bg-gray-300"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <button
//                     onClick={nextGalleryImage}
//                     className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
//                   >
//                     <ChevronRight size={24} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Details Section */}
//         <div className="lg:w-1/2">
//           <div className="sticky top-4 space-y-6">
//             <div>
//               <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
//               <p className="text-gray-600 text-sm mb-4">{product.summary}</p>

//               <div className="flex items-center mb-4">
//                 <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
//                   <Star
//                     className="text-yellow-500 fill-yellow-500 mr-1"
//                     size={16}
//                   />
//                   <span className="font-medium text-sm">{product.rating}</span>
//                 </div>
//                 <span className="ml-2 text-sm text-gray-500">
//                   ({product.reviews} reviews)
//                 </span>
//               </div>
//             </div>

//             <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
//               <div className="flex items-baseline gap-3">
//                 <span className="text-2xl font-bold text-gray-900">
//                   ₹{discountedPrice.toFixed(2)}
//                 </span>
//                 {product.discount > 0 && (
//                   <>
//                     <span className="text-lg text-gray-500 line-through">
//                       ₹{Math.round(finalPrice)}
//                     </span>
//                     <span className="ml-auto text-base font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
//                       {product.discount}% OFF
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Color Selection */}
//             <div>
//               <h3 className="text-base font-semibold mb-2">Select Color</h3>
//               <div className="flex flex-wrap gap-2">
//                 {product.colors.map((color) => (
//                   <button
//                     key={color._id}
//                     onClick={() => handleColorSelect(color)}
//                     className={`relative w-12 h-12 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
//                       selectedColor?._id === color._id
//                         ? "border-gray-900 scale-105 shadow-md"
//                         : "border-gray-200 hover:border-gray-400"
//                     }`}
//                   >
//                     <img
//                       src={color.images.main}
//                       alt={color.name}
//                       className="w-full h-full object-cover"
//                     />
//                     {selectedColor?._id === color._id && (
//                       <div className="absolute inset-0 bg-black/20"></div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//               {selectedColor && (
//                 <p className="mt-2 text-xs text-gray-600">
//                   Selected:{" "}
//                   <span className="font-medium">{selectedColor.name}</span>
//                   {selectedColor.priceAdjustment > 0 && (
//                     <span className="ml-1 text-yellow-600">
//                       (+₹{selectedColor.priceAdjustment})
//                     </span>
//                   )}
//                 </p>
//               )}
//             </div>

//             {/* Size Selection */}
//             {selectedColor && (
//               <div>
//                 <h3 className="text-base font-semibold mb-2">Select Size</h3>
//                 <div className="grid grid-cols-5 gap-2">
//                   {product.sizes.map((sizeObj) => (
//                     <button
//                       key={sizeObj._id}
//                       onClick={() => handleSizeSelect(sizeObj.size)}
//                       disabled={sizeObj.quantity === 0}
//                       className={`px-2 py-1.5 border rounded-md text-xs font-medium transition-all flex flex-col items-center ${
//                         sizeObj.quantity === 0
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : selectedSize === sizeObj.size
//                           ? "bg-gray-900 text-white border-gray-900"
//                           : "border-gray-200 hover:border-gray-900 text-gray-700"
//                       }`}
//                     >
//                       <span>{sizeObj.size}</span>
//                       {sizeObj.priceAdjustment > 0 && (
//                         <span className="text-[10px] mt-0.5">
//                           +₹{sizeObj.priceAdjustment}
//                         </span>
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Quantity Selector */}
//             {selectedSize && (
//               <div>
//                 <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
//                   Quantity
//                 </h3>
//                 <div className="flex items-center">
//                   <button
//                     onClick={decrementQuantity}
//                     disabled={selectedQuantity <= 1}
//                     className={`p-2 border rounded-l-lg ${
//                       selectedQuantity <= 1
//                         ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                         : "bg-gray-50 hover:bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     <Minus size={16} />
//                   </button>
//                   <input
//                     type="number"
//                     min="1"
//                     max={
//                       product.sizes.find((s) => s.size === selectedSize)
//                         ?.quantity || 1
//                     }
//                     value={selectedQuantity}
//                     onChange={(e) => {
//                       const newQuantity = parseInt(e.target.value) || 1;
//                       const maxAvailable = product.sizes.find(
//                         (s) => s.size === selectedSize
//                       )?.quantity;
//                       if (newQuantity > 0 && newQuantity <= maxAvailable) {
//                         setSelectedQuantity(newQuantity);
//                       }
//                     }}
//                     className="w-16 text-center border-t border-b border-gray-300 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-400"
//                   />
//                   <button
//                     onClick={incrementQuantity}
//                     disabled={
//                       selectedQuantity >=
//                       product.sizes.find((s) => s.size === selectedSize)
//                         ?.quantity
//                     }
//                     className={`p-2 border rounded-r-lg ${
//                       selectedQuantity >=
//                       product.sizes.find((s) => s.size === selectedSize)
//                         ?.quantity
//                         ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                         : "bg-gray-50 hover:bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     <Plus size={16} />
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-4">
//               <button
//                 onClick={handleAddToCart}
//                 disabled={!selectedColor || !selectedSize || isOutOfStock}
//                 className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg font-medium ${
//                   !selectedColor || !selectedSize
//                     ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                     : isOutOfStock
//                     ? "bg-red-500 text-white cursor-not-allowed"
//                     : "bg-yellow-500 hover:bg-yellow-600 text-black"
//                 }`}
//               >
//                 <ShoppingCart size={18} />
//                 {isOutOfStock ? "Out of Stock" : "Add to Cart"}
//               </button>
//               <button
//                 onClick={handleBuyNow}
//                 disabled={!selectedColor || !selectedSize || isOutOfStock}
//                 className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg font-medium ${
//                   !selectedColor || !selectedSize || isOutOfStock
//                     ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                     : "bg-gray-900 hover:bg-gray-800 text-white"
//                 }`}
//               >
//                 <Package size={18} />
//                 Buy Now
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SingleProductPage;
