import { useParams, Link } from 'react-router-dom';
import { products, brands } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductImageSlider from '../components/ProductImageSlider';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function Brand() {
  const { brandId } = useParams();
  const { addToCart } = useCart();

  const brand = brands.find((b) => b.id === brandId);

  // For demo purposes, show random products (in real app, products would have brand IDs)
  const brandProducts = products.slice(0, 8);

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

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header - Full cinematic banner */}
      <div
        className="relative h-[60vh] min-h-[400px] w-full overflow-hidden text-white flex items-center justify-center"
        style={{
          backgroundImage: brand.image ? `url('${brand.image}')` : undefined,
          backgroundColor: !brand.image ? '#6B8E23' : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-2xl">
            {brand.name}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 font-medium max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
            {(brand as any).subtitle || `Experience the essence of sustainable living with premium products from ${brand.name}`}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-gray-600">
            Showing {brandProducts.length} {brandProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brandProducts.map((product) => (
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
      </div>
    </div>
  );
}
