import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toFullUrl } from '../utils/imageUrl';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartSubtotal, getCartDiscount, getCartTotal, getItemDiscount } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#5B6F1E] mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some eco-friendly products to get started!
          </p>
          <Link
            to="/"
            className="bg-[#6B8E23] text-white px-8 py-3 rounded-full inline-block hover:bg-[#5B6F1E] transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#5B6F1E] mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 border-b last:border-b-0 flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                  <img
                    src={toFullUrl(item.image)}
                    alt={item.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mx-auto sm:mx-0"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold text-[#5B6F1E] hover:text-[#6B8E23] text-lg mb-2 block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-gray-600 text-sm mb-4">
                      {item.description}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1 border-x-2 border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                        <p className="text-[#6B8E23] font-bold text-xl">
                          ₹{item.price * item.quantity - getItemDiscount(item)}
                        </p>
                        {getItemDiscount(item) > 0 && (
                          <p className="text-red-500 text-sm">
                            You saved ₹{getItemDiscount(item)}
                          </p>
                        )}
                        <p className="text-gray-500 text-sm">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#5B6F1E] mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{getCartSubtotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>₹{getCartDiscount()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>₹{Math.round(getCartSubtotal() * 0.18)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-[#5B6F1E]">
                    <span>Total</span>
                    <span>
                      ₹{getCartTotal()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    alert('Please register or login before checking out.');
                    navigate('/login');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full bg-[#6B8E23] text-white py-3 rounded-full font-semibold hover:bg-[#5B6F1E] transition mb-3"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center text-[#6B8E23] hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
