import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600">
          Add some products to your cart to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-center gap-4 border-b py-4 hover:bg-gray-50 transition duration-200 ease-in-out"
            >
              <img
                src={item.image[0].imageUrl}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg shadow-sm"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    ₹{item.offerPrice}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ₹{item.price}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      Math.max(1, (item.quantity || 1) - 1)
                    )
                  }
                  className="p-1 rounded-full hover:bg-gray-100 transition duration-200 ease-in-out"
                >
                  <Minus size={20} className="text-gray-600" />
                </button>
                <span className="w-8 text-center text-gray-700">
                  {item.quantity || 1}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item._id, (item.quantity || 1) + 1)
                  }
                  className="p-1 rounded-full hover:bg-gray-100 transition duration-200 ease-in-out"
                >
                  <Plus size={20} className="text-gray-600" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-500 hover:text-red-600 p-2 transition duration-200 ease-in-out"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
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