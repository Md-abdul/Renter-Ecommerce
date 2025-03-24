import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, X } from "lucide-react";
import { useCart } from "../../context/CartContext";

const SingleProductPage = () => {
  const { _id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products`);
        const data = await response.json();
        const foundProduct = data.find((p) => p._id === _id);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.image[0].imageUrl);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [_id]);

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
          {product.image[0].subImages.map((img, index) => (
            <img
              key={img._id}
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
      <div className="w-1/2 flex flex-col justify-between bg-white p-6 rounded-lg ">
        <div>
          <h1 className="text-4xl font-extrabold text-black mb-2">
            {product.title}
          </h1>
          <p className="text-gray-600 text-lg mb-4">{product.summary}</p>

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
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => {
              console.log("Adding to cart:", product._id);
              addToCart(product);
            }}
            className="flex-1 bg-yellow-500 text-black px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition hover:bg-yellow-600 hover:scale-105"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
          <button
            onClick={() => {
              addToCart(product);
              navigate("/productCart/" + product._id);
            }}
            className="flex-1 bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition hover:bg-gray-900 hover:scale-105"
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
