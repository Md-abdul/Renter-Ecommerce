import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "../../context/CartContext";

const SingleProductPage = () => {
  const { _id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-100"></div>
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
    <div className="container mx-auto px-6 py-12 flex gap-10 bg-gray-100 rounded-xl shadow-xl p-8">
      {/* Left Section: Images */}
      <div className="flex gap-4 w-1/2">
        <div className="flex flex-col gap-4">
          {product.image[0].subImages.map((img, index) => (
            <img
              key={img._id}
              src={img.subImagesUrl}
              alt={`${product.title} view ${index + 1}`}
              className={`w-24 h-24 object-cover rounded-lg cursor-pointer shadow-md transition transform hover:scale-105 border-2 ${
                selectedImage === img.subImagesUrl
                  ? "border-gray-800"
                  : "border-gray-400"
              }`}
              onClick={() => setSelectedImage(img.subImagesUrl)}
            />
          ))}
        </div>
        <div className="w-full rounded-lg overflow-hidden shadow-lg">
          <img
            src={selectedImage}
            alt={product.title}
            className="w-full h-[500px] object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Right Section: Product Details */}
      <div className="w-1/2 flex flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>
          <p className="text-gray-700 text-lg mb-4">{product.summary}</p>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400 text-lg mr-2">
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
            <span className="text-gray-600">({product.reviews} reviews)</span>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">
              ₹{product.offerPrice}
            </span>
            <span className="ml-3 text-2xl text-gray-500 line-through">
              ₹{product.price}
            </span>
            <span className="ml-3 text-xl text-red-600">
              ({product.discount}% OFF)
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="border-t pt-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Product Details
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition hover:bg-gray-700 hover:scale-105"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
          <button
            onClick={() => {
              addToCart(product);
              navigate("/productCart/" + product._id);
            }}
            className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition hover:bg-gray-700 hover:scale-105"
          >
            <Package size={20} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
