import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Order {
  _id: string;
  status: string;
  products: { _id?: string; name: string; quantity: number; price: number }[];
  pricing?: { total?: number };
  createdAt?: string;
}

export default function SalesReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch a large limit to calculate reports locally
    ordersAPI
      .getAllOrders({ limit: 1000 })
      .then((res: any) => {
        setOrders(res?.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch orders for sales report', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading sales data...</div>;

  // Filter out cancelled orders for accurate sales metrics
  const validOrders = orders.filter((o) => o.status !== 'cancelled');

  // --- Total Sales ---
  const totalSales = validOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
  const totalOrdersCount = validOrders.length;

  // --- This Month Sales ---
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthOrders = validOrders.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });
  const thisMonthSalesTotal = thisMonthOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

  // --- Best Selling Products ---
  const productSalesCount: Record<string, { totalQuantity: number; revenue: number }> = {};
  validOrders.forEach(order => {
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach(item => {
        const pName = item.name || 'Unknown Product';
        if (!productSalesCount[pName]) {
          productSalesCount[pName] = { totalQuantity: 0, revenue: 0 };
        }
        productSalesCount[pName].totalQuantity += item.quantity || 1;
        productSalesCount[pName].revenue += ((item.quantity || 1) * (item.price || 0));
      });
    }
  });

  const bestSellingProducts = Object.entries(productSalesCount)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  // --- Chart Data (Last 7 Days) ---
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return {
      dateObj: d,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: 0,
      orders: 0
    };
  });

  validOrders.forEach(order => {
    if (!order.createdAt) return;
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    const dayMatch = last7DaysData.find(d => d.dateObj.getTime() === orderDate.getTime());
    if (dayMatch) {
      dayMatch.revenue += (order.pricing?.total || 0);
      dayMatch.orders += 1;
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5B6F1E] mb-6">Sales Report</h2>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{totalSales.toLocaleString()}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Lifetime earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">This Month Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{thisMonthSalesTotal.toLocaleString()}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-blue-500 font-medium mt-4">Current month performance</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalOrdersCount}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Successful orders placed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">This Month Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{thisMonthOrders.length}</h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Orders to fulfill</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#6B8E23]" /> Revenue (Last 7 Days)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="revenue" fill="#6B8E23" radius={[4, 4, 0, 0]} barSize={40} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Sellers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#6B8E23]" /> Best Selling Products
          </h3>
          {bestSellingProducts.length > 0 ? (
            <div className="space-y-4">
              {bestSellingProducts.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">Sold: {product.totalQuantity} times</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-green-700">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No data available yet.</p>
          )}
        </div>

        {/* Detailed Recent Sale Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 overflow-x-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed This Month Sales</h3>
          {thisMonthOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {thisMonthOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.products.map(p => p.name).join(', ')} ({order.products.length} items)
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-700 text-right">
                      ₹{order.pricing?.total?.toLocaleString() ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">No orders placed this month.</div>
          )}
        </div>
      </div>
    </div>
  );
}
