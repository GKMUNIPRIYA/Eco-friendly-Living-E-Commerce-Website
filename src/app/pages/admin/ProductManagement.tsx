import { useState } from 'react';
import { useAdmin, AdminProduct } from '../../context/AdminContext';
import { Edit2, Trash2, Tag, Search, Filter } from 'lucide-react';
import { toFullUrl } from '../../utils/imageUrl';
import { categories } from '../../data/products';
import AddProductForm from './AddProductForm';

export default function ProductManagement() {
  const { adminProducts, deleteAdminProduct } = useAdmin();
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (adminProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">No products added yet. Create your first product to get started!</p>
      </div>
    );
  }

  const filteredProducts = adminProducts.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || id;
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 space-y-4">
        {/* Search & Stats Header */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Tag className="w-4 h-4" />
            <span>Showing {filteredProducts.length} of {adminProducts.length} products</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === 'all'
                ? 'bg-[#6B8E23] text-white border-[#6B8E23]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#6B8E23]'
            }`}
          >
            All Products
          </button>
          {/* Group categories by parent if needed, but for now just list unique categories present in products */}
          {Array.from(new Set(adminProducts.map(p => p.category))).sort().map(catId => (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                selectedCategory === catId
                  ? 'bg-[#6B8E23] text-white border-[#6B8E23]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#6B8E23] capitalize'
              }`}
            >
              {getCategoryName(catId)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No products found matching your current filters.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 md:p-6 group">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border">
                  <img
                    src={toFullUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-xl font-bold text-[#5B6F1E] truncate">{product.name}</h3>
                    <div className="flex items-center gap-2">
                       <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            try {
                              await deleteAdminProduct(product.id);
                            } catch (err: any) {
                              alert(err?.message || 'Failed to delete product');
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 max-w-2xl">{product.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-[#6B8E23]">₹{product.price}</span>
                    <span className="bg-green-50 text-[#6B8E23] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 italic">
                      {getCategoryName(product.category)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingProduct && (
        <AddProductForm
          initialData={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}
