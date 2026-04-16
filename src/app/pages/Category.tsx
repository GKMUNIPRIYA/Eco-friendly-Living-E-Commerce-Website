import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { categories, products as staticProducts } from '../data/products';
import { useCart, type Product } from '../context/CartContext';
import ProductImageSlider from '../components/ProductImageSlider';
import { ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { productsAPI, offersAPI, ordersAPI } from '../services/api';

export default function Category() {
  const { categoryId } = useParams();
  const { addToCart } = useCart();

  const category = categories.find((c) => c.id === categoryId);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');

  useEffect(() => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    // Get static products for this category as fallback
    const fallbackProducts: Product[] = staticProducts.filter(
      (p) => p.category === categoryId
    );

    productsAPI
      .getByCategory(categoryId, { page: 1, limit: 100 })
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

        // Merge: API products first, then static products not already in API results
        const apiIds = new Set(apiProducts.map((p) => p.id));
        const merged = [
          ...apiProducts,
          ...fallbackProducts.filter((p) => !apiIds.has(p.id)),
        ];
        setCategoryProducts(merged);
      })
      .catch((err: any) => {
        console.error('Failed to load products for category', err);
        // On API error, show static products as fallback
        setCategoryProducts(fallbackProducts);
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  // Load active offers to show on product cards
  useEffect(() => {
    offersAPI
      .getActive()
      .then((res: any) => {
        const items = res?.data || [];
        setActiveOffers(items);
      })
      .catch((err: any) => {
        console.error('Failed to load active offers', err);
        setActiveOffers([]);
      });
  }, []);

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

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#5B6F1E]">Category not found</h1>
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
      {/* Category Header - Full cinematic banner */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover object-center transform scale-105"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              {category.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/95 font-medium max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              {(category as any).subtitle || `Discover our curated collection of premium eco-friendly ${category.name.toLowerCase()} essentials`}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">
              No products available in this category yet.
            </p>
            <Link
              to="/"
              className="bg-[#6B8E23] text-white px-6 py-3 rounded-full inline-block hover:bg-[#5B6F1E] transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                Showing {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group relative"
                  >
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle wishlist toggle
                        const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
                        if (!token) {
                          alert('Please login to add to wishlist');
                          return;
                        }
                        try {
                          const res: any = await ordersAPI.toggleWishlist(product.id);
                          if (res.success || res.added !== undefined) {
                            const newWishlist = new Set(wishlistIds);
                            if (res.added) {
                              newWishlist.add(product.id);
                              toast.success('Added to wishlist ❤️');
                            } else {
                              newWishlist.delete(product.id);
                              toast.info('Removed from wishlist');
                            }
                            setWishlistIds(newWishlist);
                          } else {
                            toast.error(res.error?.message || 'Could not update wishlist. Please try again.');
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to update wishlist server error');
                        }
                      }}
                      className={`absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full transition shadow-sm ${
                        wishlistIds.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${wishlistIds.has(product.id) ? 'fill-red-500' : ''}`} />
                    </button>
                    <Link to={`/product/${product.id}`}>
                      <div className="relative overflow-hidden">
                      {activeOffers
                        .filter(
                          (o) =>
                            o.isActive &&
                            Array.isArray(o.applicableCategories) &&
                            o.applicableCategories.includes(product.category)
                        )
                        .slice(0, 1)
                        .map((offer) => (
                          <div
                            key={offer._id || offer.id}
                            className="absolute top-2 left-2 bg-[#FF6B35] text-white text-xs font-bold px-3 py-1 rounded-full z-10"
                          >
                            {offer.discount}% OFF
                          </div>
                        ))}
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
