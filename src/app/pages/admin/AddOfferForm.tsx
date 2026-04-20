import { useState } from 'react';
import { useAdmin, Offer } from '../../context/AdminContext';
import { X, Search, Check, Package, Layers } from 'lucide-react';
import { categories } from '../../data/products';
import { offersAPI } from '../../services/api';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  initialData?: Offer;
}

export default function AddOfferForm({ onClose, initialData }: Props) {
  const { addOffer, updateOffer, adminProducts } = useAdmin();
  const [productSearch, setProductSearch] = useState('');
  const [offerType, setOfferType] = useState<'category' | 'product'>('category');

  // Convert ISO dates to YYYY-MM-DD for the date input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState<Offer>(initialData ? {
    ...initialData,
    validFrom: formatDateForInput(initialData.validFrom),
    validTo: formatDateForInput(initialData.validTo),
    applicableCategories: initialData.applicableCategories || [],
    applicableProducts: initialData.applicableProducts || [],
  } : {
    id: '',
    title: '',
    description: '',
    discount: 0,
    validFrom: '',
    validTo: '',
    applicableCategories: [],
    applicableProducts: [],
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'discount' ? parseFloat(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(categoryId)
        ? prev.applicableCategories.filter((id) => id !== categoryId)
        : [...prev.applicableCategories, categoryId],
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter((id) => id !== productId)
        : [...prev.applicableProducts, productId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.discount && formData.validFrom && formData.validTo) {
      try {
        const payload = {
          title: formData.title,
          description: formData.description,
          discount: formData.discount,
          validFrom: formData.validFrom,
          validTo: formData.validTo,
          applicableCategories: formData.applicableCategories,
          applicableProducts: formData.applicableProducts,
          isActive: formData.isActive,
        };

        const isEdit = !!initialData;
        const res: any = isEdit 
          ? await offersAPI.update(initialData!.id, payload)
          : await offersAPI.create(payload);
          
        const updated = res?.data || res;

        const updatedOffer: Offer = {
          id: updated?._id || updated?.id || (isEdit ? initialData!.id : Date.now().toString()),
          title: updated?.title || formData.title,
          description: updated?.description ?? formData.description,
          discount: updated?.discount ?? formData.discount,
          validFrom: updated?.validFrom || formData.validFrom,
          validTo: updated?.validTo || formData.validTo,
          applicableCategories: updated?.applicableCategories || formData.applicableCategories,
          applicableProducts: updated?.applicableProducts || formData.applicableProducts,
          isActive: updated?.isActive ?? formData.isActive,
        };

        if (isEdit) {
          updateOffer(initialData!.id, updatedOffer);
          toast.success('Offer updated successfully');
        } else {
          addOffer(updatedOffer);
          toast.success('Offer created and saved');
        }

        onClose();
      } catch (error: any) {
        console.error('Failed to save offer', error);
        toast.error(error?.message || `Failed to ${initialData ? 'update' : 'create'} offer`);
      }
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const filteredProducts = adminProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#6B8E23] text-white p-6 md:px-8 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{initialData ? 'Edit Offer' : 'Create Special Offer'}</h2>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Campaign Settings</p>
          </div>
          <button onClick={onClose} className="bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8 scrollbar-thin">
          {/* Basic Info Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-[#6B8E23] uppercase tracking-widest mb-2">Offer Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#6B8E23]/10 transition-all"
                  placeholder="e.g., Diwali Blowout - 50% OFF"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-[#6B8E23] uppercase tracking-widest mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6B8E23]/10 transition-all font-medium"
                  placeholder="Tell your customers about this deal..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#6B8E23] uppercase tracking-widest mb-2">Discount Percentage *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-2xl font-black text-[#6B8E23] focus:outline-none transition-all"
                    placeholder="20"
                    min="0"
                    max="100"
                    required
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-2xl">%</span>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center group cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#6B8E23] transition-all duration-300 shadow-inner" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-sm" />
                  </div>
                  <span className="ml-4 font-black text-sm uppercase tracking-widest text-gray-500 group-hover:text-gray-700">Currently {formData.isActive ? 'Active' : 'Paused'}</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-green-50 rounded-3xl border border-green-100">
              <div>
                <label className="block text-[10px] font-black text-[#6B8E23] uppercase tracking-widest mb-2">Campaign Starts</label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-green-100 rounded-xl font-bold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B8E23] uppercase tracking-widest mb-2">Campaign Ends</label>
                <input
                  type="date"
                  name="validTo"
                  value={formData.validTo}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-green-100 rounded-xl font-bold focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Targeting Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
               <h3 className="text-sm font-black uppercase tracking-tighter text-gray-400">Targeting Strategy</h3>
               <div className="h-px bg-gray-100 flex-1" />
            </div>

            <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-2 font-black text-xs uppercase tracking-widest">
               <button 
                 type="button"
                 onClick={() => setOfferType('category')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${offerType === 'category' ? 'bg-white shadow-sm text-[#6B8E23]' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <Layers className="w-4 h-4" /> By Category
               </button>
               <button 
                 type="button"
                 onClick={() => setOfferType('product')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${offerType === 'product' ? 'bg-white shadow-sm text-[#6B8E23]' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <Package className="w-4 h-4" /> By Product
               </button>
            </div>

            {offerType === 'category' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all group ${
                      formData.applicableCategories.includes(category.id)
                        ? 'bg-[#6B8E23]/5 border-[#6B8E23] text-[#6B8E23] ring-1 ring-[#6B8E23]'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold truncate pr-2 capitalize">{category.name}</span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                      formData.applicableCategories.includes(category.id) ? 'bg-[#6B8E23] border-[#6B8E23]' : 'border-gray-200 group-hover:border-gray-300'
                    }`}>
                      {formData.applicableCategories.includes(category.id) && <Check className="w-2.5 h-2.5 text-white stroke-[4]" />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search to select products..."
                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6B8E23]/10"
                     value={productSearch}
                     onChange={(e) => setProductSearch(e.target.value)}
                   />
                </div>
                
                <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin">
                   {filteredProducts.map(product => (
                     <button
                       key={product.id}
                       type="button"
                       onClick={() => handleProductToggle(product.id)}
                       className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                         formData.applicableProducts.includes(product.id)
                           ? 'bg-[#6B8E23]/5 border-[#6B8E23] text-[#6B8E23]'
                           : 'bg-white border-gray-50 text-gray-500 hover:border-gray-200'
                       }`}
                     >
                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="flex-1 text-left text-sm font-bold truncate">{product.name}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          formData.applicableProducts.includes(product.id) ? 'bg-[#6B8E23] border-[#6B8E23]' : 'border-gray-200'
                        }`}>
                          {formData.applicableProducts.includes(product.id) && <Check className="w-3 h-3 text-white stroke-[4]" />}
                        </div>
                     </button>
                   ))}
                </div>
                
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#6B8E23]">
                   <span>{formData.applicableProducts.length} Products Selected</span>
                   <button type="button" onClick={() => setFormData(p => ({...p, applicableProducts: []}))} className="text-red-400 hover:text-red-500">Clear All</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 shrink-0">
            <button
              type="submit"
              className="flex-[2] bg-[#6B8E23] text-white py-4 rounded-3xl hover:bg-[#5B7A1E] transition-all font-black uppercase tracking-widest shadow-xl shadow-green-900/10 active:scale-95"
            >
              {initialData ? 'Update Campaign' : 'Launch Campaign'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-3xl hover:bg-gray-200 transition-all font-black uppercase tracking-widest active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
