import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderId } = useParams();

  return (
    <div
      className="min-h-screen py-12 relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-white/80" />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-[#5B6F1E] mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-600 mb-2">
            Thank you for your eco-friendly purchase!
          </p>
          <p className="text-gray-600 mb-8">
            Your order has been confirmed and will be shipped soon.
          </p>

          {/* Order ID */}
          <div className="bg-[#F5F5DC] rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">Order ID</p>
            <p className="text-2xl font-bold text-[#6B8E23]">{orderId}</p>
          </div>

          {/* Order Timeline */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#5B6F1E] mb-6">
              What's Next?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#5B6F1E]">Order Confirmed</h3>
                  <p className="text-gray-600 text-sm">
                    We've received your order and sent a confirmation email
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Order Processing</h3>
                  <p className="text-gray-600 text-sm">
                    Your items are being carefully packed with eco-friendly materials
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Shipped</h3>
                  <p className="text-gray-600 text-sm">
                    Your order will be dispatched within 2-3 business days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Delivered</h3>
                  <p className="text-gray-600 text-sm">
                    Expected delivery in 5-7 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Eco Message */}
          <div className="bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] text-white rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-2">🌱 Thank You for Choosing Sustainable!</h3>
            <p className="text-sm">
              Your purchase helps reduce plastic waste and supports eco-friendly businesses.
              Together, we're making a positive impact on our planet!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-[#6B8E23] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#5B6F1E] transition"
            >
              Continue Shopping
            </Link>
            <Link
              to="/blog"
              className="border-2 border-[#6B8E23] text-[#6B8E23] px-8 py-3 rounded-full font-semibold hover:bg-[#6B8E23] hover:text-white transition"
            >
              Read Eco Tips
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            A confirmation email has been sent to your registered email address.
          </p>
          <p className="mt-2">
            Need help? <Link to="/contact" className="text-[#6B8E23] hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
