import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import ProductImageSlider from '../components/ProductImageSlider';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../context/CartContext';

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    ordersAPI
      .getWishlist()
      .then((res: any) => {
        const list = res?.data || res?.wishlist || [];
        const mapped: Product[] = (Array.isArray(list) ? list : []).map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          images: p.images || [],
          category: p.category,
          description: p.description,
        }));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleRemove = async (productId: string) => {
    try {
      const res: any = await ordersAPI.toggleWishlist(productId);
      if (res.success && !res.added) {
        setItems((prev) => prev.filter((p) => p.id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch {
      toast.error('Could not remove');
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#5B6F1E] mb-8 flex items-center gap-2">
          <Heart className="w-8 h-8" />
          My Wishlist
        </h1>

        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <Link to="/" className="text-[#6B8E23] hover:underline font-medium">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="overflow-hidden">
                    <ProductImageSlider
                      image={product.image}
                      images={product.images}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-[#5B6F1E] mb-2 hover:text-[#6B8E23] line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[#6B8E23] font-bold text-lg mb-3">₹{product.price}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#6B8E23] text-white py-2 rounded-lg hover:bg-[#5B7A1E] text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="p-2 text-gray-500 hover:text-red-500"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
