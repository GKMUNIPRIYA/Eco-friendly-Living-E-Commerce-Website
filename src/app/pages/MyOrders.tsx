import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Loader } from 'lucide-react';
import { ordersAPI } from '../services/api';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  products: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  pricing: {
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    total: number;
  };
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    ordersAPI
      .getUserOrders()
      .then((res: any) => {
        if (res.success) {
          setOrders(res.data || []);
        } else {
          setError(res.error?.message || 'Failed to load orders');
        }
      })
      .catch((err: any) => {
        console.error('Failed to load orders', err);
        setError(err?.message || 'Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIdx = steps.indexOf(status as any);
    return steps.map((step, idx) => ({
      step,
      completed: idx <= currentIdx,
      label: step.charAt(0).toUpperCase() + step.slice(1),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-[#6B8E23]" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-[#6B8E23] hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#5B6F1E] mb-8">My Orders</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              You haven't placed any orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start shopping for eco-friendly products today!
            </p>
            <Link
              to="/"
              className="bg-[#6B8E23] text-white px-6 py-3 rounded-full inline-block hover:bg-[#5B6F1E] transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#5B6F1E] mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => {
            const statusSteps = getStatusSteps(order.status);
            return (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-bold text-[#5B6F1E]">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-[#6B8E23]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {order.status !== 'cancelled' && order.status !== 'refunded' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      {statusSteps.map((item, idx) => (
                        <div key={item.step} className="flex flex-col items-center flex-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                              item.completed
                                ? 'bg-[#6B8E23] text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            ✓
                          </div>
                          <p className="text-xs text-center text-gray-600">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      {statusSteps.map((item, idx) => (
                        <div
                          key={item.step}
                          className={`flex-1 h-1 ${
                            idx < statusSteps.length - 1
                              ? item.completed
                                ? 'bg-[#6B8E23]'
                                : 'bg-gray-200'
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-[#5B6F1E] mb-4">Items</h3>
                  <div className="space-y-3">
                    {order.products.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-[#6B8E23]">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-[#F5F5DC] rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{order.pricing.subtotal}</span>
                    </div>
                    {order.pricing.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-semibold">-₹{order.pricing.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">₹{order.pricing.tax}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#6B8E23]">₹{order.pricing.total}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h4 className="font-semibold text-[#5B6F1E] mb-2">Delivery Address</h4>
                  <p className="text-gray-700">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-[#6B8E23] hover:text-[#5B6F1E] font-semibold">
                    Track Order
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
