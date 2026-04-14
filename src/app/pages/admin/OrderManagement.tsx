import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';

interface Order {
  _id: string;
  status: string;
  products: { name: string; quantity: number; price: number }[];
  customerInfo?: { firstName?: string; lastName?: string; email?: string };
  pricing?: { total?: number };
  createdAt?: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getAllOrders({ limit: 100 })
      .then((res: any) => {
        setOrders(res?.data || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-800">
                  {order._id?.slice(-8).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.products?.length || 0} item(s)
                </td>
                <td className="px-5 py-4 text-sm font-bold text-gray-900">
                  ₹{order.pricing?.total?.toLocaleString() ?? 0}
                </td>
                <td className="px-5 py-4">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    order.status === 'processing' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                    order.status === 'confirmed' ? 'bg-teal-100 text-teal-700 border-teal-200' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="text-xs font-bold border-2 border-gray-100 rounded-xl px-3 py-2 bg-gray-50 focus:border-[#6B8E23] focus:outline-none transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <div className="p-12 text-center text-gray-600">No orders yet</div>
      )}
    </div>
  );
}
