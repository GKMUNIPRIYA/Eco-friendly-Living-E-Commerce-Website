import { useAdmin } from '../../context/AdminContext';
import { Edit2, Trash2 } from 'lucide-react';
import { toFullUrl } from '../../utils/imageUrl';

export default function ProductManagement() {
  const { adminProducts, deleteAdminProduct } = useAdmin();

  if (adminProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">No products added yet. Create your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {adminProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <img
              src={toFullUrl(product.image)}
              alt={product.name}
              className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#5B6F1E] mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-3">{product.description}</p>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-2xl font-bold text-[#6B8E23]">₹{product.price}</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
              <button className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit product">
                <Edit2 className="w-5 h-5" />
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
                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete product"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
