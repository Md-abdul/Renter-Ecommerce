import React, { useEffect, useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, fetchCart } =
    useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchCart().finally(() => setLoading(false));
  }, [fetchCart]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Loading Cart...</h2>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your cart is empty
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-center gap-4 border border-gray-300 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg shadow-sm"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Color: {item.color} | Size: {item.size}
                </p>
                {/* <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-yellow-600">
                    ₹{item.price}
                  </span>
                </div> */}
               
                <div className="flex items-center mt-2">
                  {item.discount > 0 ? (
                    <>
                      <span className="text-lg font-bold text-yellow-600">
                        ₹{item.price}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{item.originalPrice}
                      </span>
                      <span className="ml-2 text-sm font-medium text-green-600">
                        ({item.discount}% OFF)
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-yellow-600">
                      ₹{Math.round(item.price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setUpdating(item._id);
                    updateQuantity(item._id, item.quantity - 1).finally(() =>
                      setUpdating(null)
                    );
                  }}
                  disabled={updating === item._id || item.quantity === 1}
                  className={`p-2 rounded-full ${
                    updating === item._id
                      ? "bg-gray-300"
                      : "bg-gray-200 hover:bg-yellow-500 hover:text-white"
                  } transition duration-200`}
                >
                  <Minus size={20} />
                </button>
                <span className="w-8 text-center text-black font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => {
                    setUpdating(item._id);
                    updateQuantity(item._id, item.quantity + 1).finally(() =>
                      setUpdating(null)
                    );
                  }}
                  disabled={
                    updating === item._id || item.quantity >= item.maxQuantity
                  }
                  className={`p-2 rounded-full ${
                    updating === item._id
                      ? "bg-gray-300"
                      : "bg-gray-200 hover:bg-yellow-500 hover:text-white"
                  } transition duration-200`}
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-500 hover:text-red-600 p-2 transition duration-200"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-gray-100 rounded-lg shadow-lg p-6 border border-gray-300">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-black">₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-black">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-black">Total</span>
                  <span className="text-black">₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-6 w-full bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 transition duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;