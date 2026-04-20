import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { products as staticProducts, brands } from '../data/products';
import { useCart, type Product } from '../context/CartContext';
import ProductImageSlider from '../components/ProductImageSlider';
import { ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { productsAPI, ordersAPI } from '../services/api';
import { ImageWithFallback } from '../components/UIUX/ImageWithFallback';

export default function Brand() {
  const { brandId } = useParams();
  const { addToCart } = useCart();

  const brand = brands.find((b) => b.id === brandId);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');

  useEffect(() => {
    if (!brandId) return;

    setLoading(true);
    const fallbackProducts = staticProducts.filter(p => p.category === brandId);

    productsAPI.getByCategory(brandId, { page: 1, limit: 100 })
      .then((res: any) => {
        const items = res?.data || [];
        const apiProducts: Product[] = items.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          images: p.images || [],
          category: p.category,
          description: p.description,
        }));

        const apiIds = new Set(apiProducts.map(p => p.id));
        const merged = [...apiProducts, ...fallbackProducts.filter(p => !apiIds.has(p.id))];
        setBrandProducts(merged);
      })
      .catch(err => {
        console.error('Failed to load brand products', err);
        setBrandProducts(fallbackProducts);
      })
      .finally(() => setLoading(false));
  }, [brandId]);

  useEffect(() => {
    if (token) {
      ordersAPI.getWishlist()
        .then((res: any) => {
          const list = res?.data || [];
          setWishlistIds(new Set(list.map((item: any) => item._id || item)));
        })
        .catch(console.error);
    }
  }, [token]);

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#5B6F1E]">Brand not found</h1>
        <Link to="/" className="text-[#6B8E23] hover:underline mt-4 inline-block">
          Return to home
        </Link>
      </div>
    );
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header - Full cinematic banner */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <ImageWithFallback
          src={brand.image}
          alt={brand.name}
          className="w-full h-full object-cover object-center transform scale-105"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              {brand.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/95 font-medium max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              {(brand as any).subtitle || `Discover the eco-friendly essence of ${brand.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Loading brand products...</p>
          </div>
        ) : brandProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">
              Currently no products listed under {brand.name}.
            </p>
            <Link
              to="/"
              className="bg-[#6B8E23] text-white px-6 py-3 rounded-full inline-block hover:bg-[#5B6F1E] transition"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                Showing {brandProducts.length} {brandProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {brandProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group relative"
                >
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!token) {
                        toast.error('Please login to use wishlist');
                        return;
                      }
                      try {
                        const res: any = await ordersAPI.toggleWishlist(product.id);
                        const newWishlist = new Set(wishlistIds);
                        if (res.added) {
                          newWishlist.add(product.id);
                          toast.success('Added to wishlist');
                        } else {
                          newWishlist.delete(product.id);
                          toast.info('Removed from wishlist');
                        }
                        setWishlistIds(newWishlist);
                      } catch (err) {
                        toast.error('Failed to update wishlist');
                      }
                    }}
                    className={`absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full transition ${
                      wishlistIds.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${wishlistIds.has(product.id) ? 'fill-red-500' : ''}`} />
                  </button>
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
                      <h3 className="font-semibold text-[#5B6F1E] mb-2 hover:text-[#6B8E23] line-clamp-2 uppercase">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[#6B8E23] font-bold text-lg">₹{product.price}</p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-[#6B8E23] text-white p-2 rounded-full hover:bg-[#5B6F1E] transition"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
