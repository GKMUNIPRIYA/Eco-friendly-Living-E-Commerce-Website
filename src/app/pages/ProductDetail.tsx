import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart, type Product } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductImageSlider from '../components/ProductImageSlider';
import { ShoppingCart, Heart, Share2, Leaf, Package } from 'lucide-react';
import { toast } from 'sonner';
import { productsAPI, ordersAPI } from '../services/api';
import { products as staticProducts } from '../data/products';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    // Try static data first as a fast fallback
    const staticMatch = staticProducts.find((p) => p.id === productId);

    productsAPI
      .getById(productId)
      .then((res: any) => {
        const p = res?.data || res;
        if (!p || !p.name) {
          // API returned empty — use static fallback
          if (staticMatch) {
            setProduct(staticMatch);
          } else {
            setError('Product not found');
            setProduct(null);
          }
          return;
        }
        const mapped: Product = {
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          images: p.images || [],
          category: p.category,
          description: p.description,
        };
        setProduct(mapped);
      })
      .catch((err: any) => {
        console.error('Failed to load product', err);
        // Use static fallback on API error
        if (staticMatch) {
          setProduct(staticMatch);
          setError(null);
        } else {
          setError(err?.message || 'Product not found');
          setProduct(null);
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (isAuthenticated && product?.id) {
      ordersAPI.getWishlist()
        .then((res: any) => {
          const list = res?.data || [];
          const isAdded = list.some((item: any) => (item._id || item) === product.id);
          setInWishlist(isAdded);
        })
        .catch(console.error);
    }
  }, [isAuthenticated, product?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#5B6F1E] mb-4">Loading product...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#5B6F1E] mb-4">Product not found</h1>
        <Link to="/" className="text-[#6B8E23] hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/cart');
  };

  const relatedProducts: Product[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#6B8E23]">Home</Link>
            <span>/</span>
            <Link to={`/category/${product.category}`} className="hover:text-[#6B8E23]">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-[#5B6F1E]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image Slider */}
          <div>
            <ProductImageSlider
              image={product.image}
              images={product.images}
              alt={product.name}
              mode="detail"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#6B8E23] text-white px-3 py-1 rounded-full text-sm">
                Eco-Friendly
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                In Stock
              </span>
            </div>

            <h1 className="text-3xl font-bold text-[#5B6F1E] mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 text-lg mb-6">{product.description}</p>

            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-4xl font-bold text-[#6B8E23]">₹{product.price}</p>
              <p className="text-gray-500 line-through">₹{Math.round(product.price * 1.3)}</p>
              <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm">
                Save 23%
              </span>
            </div>

            {/* Features */}
            <div className="bg-[#F5F5DC] rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-[#5B6F1E] mb-4">Product Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-[#6B8E23]" />
                  <span className="text-gray-700">100% Natural & Biodegradable</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-[#6B8E23]" />
                  <span className="text-gray-700">Plastic-Free Packaging</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-[#6B8E23]" />
                  <span className="text-gray-700">Cruelty-Free & Vegan</span>
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x-2 border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white border-2 border-[#6B8E23] text-[#6B8E23] px-6 py-4 rounded-full font-bold hover:bg-[#6B8E23] hover:text-white transition flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#6B8E23] text-white px-6 py-4 rounded-full font-bold hover:bg-[#5B6F1E] transition active:scale-95 shadow-lg shadow-green-900/20"
              >
                Buy Now
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  if (!isAuthenticated) {
                    toast.error('Please sign in to add to wishlist');
                    navigate('/login');
                    return;
                  }
                  try {
                    const res: any = await ordersAPI.toggleWishlist(product.id);
                    if (res.success) {
                      setInWishlist(!!res.added);
                      toast.success(res.added ? 'Added to wishlist ❤️' : 'Removed from wishlist');
                    } else {
                      toast.error('Could not update wishlist. Please try again.');
                    }
                  } catch (e: any) {
                    console.error(e);
                    const isAuthError = e?.message?.includes('401') || e?.message?.includes('Unauthorized');
                    if (isAuthError) {
                      toast.error('Session expired. Please sign in again.');
                      navigate('/login');
                    } else {
                      toast.error('Could not update wishlist. Please try again.');
                    }
                  }
                }}
                className={`flex items-center gap-2 transition-colors ${inWishlist ? 'text-red-600' : 'text-gray-600 hover:text-[#6B8E23]'}`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : ''}`} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button
                onClick={async () => {
                  const url = window.location.href;
                  const shareData = {
                    title: product.name,
                    text: `${product.name} - ₹${product.price}`,
                    url,
                  };
                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                      toast.success('Product shared!');
                    } catch (err: any) {
                      if (err.name !== 'AbortError') {
                        await navigator.clipboard.writeText(url);
                        toast.success('Link copied to clipboard');
                      }
                    }
                  } else {
                    await navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard');
                  }
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-[#6B8E23]"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#5B6F1E] mb-8">
              You May Also Like
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
                >
                  <div className="overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#5B6F1E] mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-[#6B8E23] font-bold">₹{relatedProduct.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
