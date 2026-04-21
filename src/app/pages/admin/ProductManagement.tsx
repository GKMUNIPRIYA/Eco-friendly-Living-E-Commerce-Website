import { useState } from 'react';
import { useAdmin, AdminProduct } from '../../context/AdminContext';
import { Edit2, Trash2, Tag, Search, Filter } from 'lucide-react';
import { toFullUrl } from '../../utils/imageUrl';
import { categories } from '../../data/products';
import AddProductForm from './AddProductForm';

export default function ProductManagement() {
  const { adminProducts, totalProducts, deleteAdminProduct } = useAdmin();
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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Left Sidebar (Desktop) / Top Bar (Mobile) ── */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-[#5B6F1E] text-sm uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter by
            </h3>
            <span className="bg-green-50 text-[#6B8E23] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {totalProducts} Total
            </span>
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories Vertical Menu */}
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                selectedCategory === 'all'
                  ? 'bg-[#6B8E23] text-white shadow-md shadow-green-100'
                  : 'text-gray-500 hover:bg-green-50 hover:text-[#6B8E23]'
              }`}
            >
              <span>All Products</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                {totalProducts}
              </span>
            </button>
            
            {Array.from(new Set(adminProducts.map(p => p.category))).sort().map(catId => {
              const count = adminProducts.filter(p => p.category === catId).length;
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group capitalize ${
                    selectedCategory === catId
                      ? 'bg-[#6B8E23] text-white shadow-md shadow-green-100'
                      : 'text-gray-700 hover:bg-green-50 hover:text-[#6B8E23]'
                  }`}
                >
                  <span className="truncate">{getCategoryName(catId)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === catId ? 'bg-white/20' : 'bg-gray-200 text-gray-500 font-black'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Product Grid ── */}
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">
            Showing <span className="text-[#6B8E23] font-bold">{filteredProducts.length}</span> products 
            {selectedCategory !== 'all' && <span> in <span className="capitalize text-[#6B8E23] font-bold">"{getCategoryName(selectedCategory)}"</span></span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6B8E23] animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Catalog</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-200 p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">No matching products</h4>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">We couldn't find any products matching your search or filter criteria.</p>
              <button 
                onClick={() => {setSelectedCategory('all'); setSearchQuery('');}}
                className="mt-6 text-[#6B8E23] font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all duration-500 border border-gray-100 p-5 md:p-6 group relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                  {/* Image wrapper */}
                  <div className="w-full md:w-40 h-52 md:h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 group-hover:border-[#6B8E23]/20 transition-colors">
                    <img
                      src={toFullUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 shadow-inner"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-50 text-[#6B8E23] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border border-green-100">
                            {getCategoryName(product.category)}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-gray-800 truncate group-hover:text-[#6B8E23] transition-colors leading-tight">
                          {product.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Permanently delete this product? This action cannot be undone.')) {
                              try {
                                await deleteAdminProduct(product.id);
                              } catch (err: any) {
                                alert(err?.message || 'Failed to delete product');
                              }
                            }
                          }}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed italic">
                      {product.description}
                    </p>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</span>
                        <span className="text-3xl font-black text-[#6B8E23] tracking-tighter">₹{product.price}</span>
                      </div>
                      <div className="flex gap-4 mb-1">
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Stock</span>
                           <span className="text-sm font-bold text-gray-700">In Stock</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingProduct && (
        <AddProductForm
          initialData={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
