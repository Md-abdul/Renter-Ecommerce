import React, { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ChevronLeft, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, fetchCart } =
    useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isRemoving, setIsRemoving] = useState(null);

  useEffect(() => {
    fetchCart().finally(() => setLoading(false));
  }, [fetchCart]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-96 w-full bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="text-yellow-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-yellow-600 hover:text-yellow-700 mr-4 transition-colors"
        >
          <ChevronLeft className="mr-1" size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
        <span className="ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200"
                />

                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.color && `Color: ${item.color}`}
                        {item.size && ` | Size: ${item.size}`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsRemoving(item._id);
                        removeFromCart(item._id).finally(() =>
                          setIsRemoving(null)
                        );
                      }}
                      disabled={isRemoving === item._id}
                      className={`p-2 rounded-full ml-4 ${
                        isRemoving === item._id
                          ? "text-gray-400"
                          : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                      } transition-colors`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center mt-3">
                    {item.discount > 0 ? (
                      <>
                        <span className="text-lg font-bold text-yellow-600">
                          ₹{item.price}
                        </span>
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          ₹{item.originalPrice}
                        </span>
                        <span className="ml-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {item.discount}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-yellow-600">
                        ₹{Math.round(item.price)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          setUpdating(item._id);
                          updateQuantity(item._id, item.quantity - 1).finally(
                            () => setUpdating(null)
                          );
                        }}
                        disabled={updating === item._id || item.quantity === 1}
                        className={`px-3 py-1 ${
                          updating === item._id || item.quantity === 1
                            ? "bg-gray-100 text-gray-400"
                            : "bg-gray-50 hover:bg-yellow-100 text-gray-700"
                        } transition-colors`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-gray-800 font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          setUpdating(item._id);
                          updateQuantity(item._id, item.quantity + 1).finally(
                            () => setUpdating(null)
                          );
                        }}
                        disabled={
                          updating === item._id ||
                          item.quantity >= item.maxQuantity
                        }
                        className={`px-3 py-1 ${
                          updating === item._id ||
                          item.quantity >= item.maxQuantity
                            ? "bg-gray-100 text-gray-400"
                            : "bg-gray-50 hover:bg-yellow-100 text-gray-700"
                        } transition-colors`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="ml-auto text-sm text-gray-500">
                      ₹{Math.round((item.price * item.quantity).toFixed(2))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-600 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal ({cart.length} items)
                </span>
                <span className="font-medium text-gray-800">
                  ₹{getTotalPrice()}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-green-600">FREE</span>
              </div> */}
              <div className="flex justify-between text-lg font-semibold pt-4 border-t border-gray-200 mt-4">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">₹{getTotalPrice()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md flex items-center justify-center cursor-pointer"
            >
              Proceed to Checkout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="mt-4 flex items-center text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
