import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { type Product } from '../context/CartContext';
import ProductImageSlider from '../components/ProductImageSlider';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Search() {
  const query = useQuery();
  const searchTerm = query.get('q') || '';
  const { addToCart } = useCart();

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    productsAPI
      .getAll({ search: searchTerm.trim(), page: 1, limit: 100 })
      .then((res: any) => {
        let items = res?.data || res?.products || [];
        // Client-side filter fallback when backend doesn't support search
        const term = searchTerm.trim().toLowerCase();
        if (term && items.length > 0) {
          const filtered = items.filter(
            (p: any) =>
              (p.name || '').toLowerCase().includes(term) ||
              (p.description || '').toLowerCase().includes(term) ||
              (p.category || '').toLowerCase().includes(term)
          );
          items = filtered;
        }
        const mapped: Product[] = items.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          images: p.images || [],
          category: p.category,
          description: p.description,
        }));
        setResults(mapped);
      })
      .catch((err: any) => {
        console.error('Failed to search products', err);
        setError(err?.message || 'Failed to search products');
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [searchTerm]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#5B6F1E] mb-4">
          Search results for "{searchTerm}"
        </h1>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Searching products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : !searchTerm.trim() ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              Type a product name in the search bar to find eco-friendly products.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No products found matching your search.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Showing {results.length}{' '}
              {results.length === 1 ? 'result' : 'results'}
            </p>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((product) => (
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
          </>
        )}
      </div>
    </div>
  );
}

