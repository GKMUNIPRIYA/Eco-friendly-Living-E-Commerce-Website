import { useState } from 'react';
import { useAdmin, Offer } from '../../context/AdminContext';
import { X } from 'lucide-react';
import { categories } from '../../data/products';
import { offersAPI } from '../../services/api';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  initialData?: Offer;
}

export default function AddOfferForm({ onClose, initialData }: Props) {
  const { addOffer, updateOffer } = useAdmin();
  const [formData, setFormData] = useState<Offer>(initialData || {
    id: '',
    title: '',
    description: '',
    discount: 0,
    validFrom: '',
    validTo: '',
    applicableCategories: [],
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'discount' ? parseFloat(value) : name === 'isActive' ? (e.target as HTMLInputElement).checked : value,
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
          isActive: formData.isActive,
        };

        const isEdit = !!initialData;
        const res: any = isEdit 
          ? await offersAPI.update(initialData!.id, payload)
          : await offersAPI.create(payload);
          
        const updated = res?.data || res;

        if (isEdit) {
          updateOffer({
            id: updated?._id || updated?.id || initialData!.id,
            title: updated?.title || formData.title,
            description: updated?.description ?? formData.description,
            discount: updated?.discount ?? formData.discount,
            validFrom: updated?.validFrom || formData.validFrom,
            validTo: updated?.validTo || formData.validTo,
            applicableCategories: updated?.applicableCategories || formData.applicableCategories,
            isActive: updated?.isActive ?? formData.isActive,
          });
          toast.success('Offer updated successfully');
        } else {
          addOffer({
            id: updated?._id || updated?.id || Date.now().toString(),
            title: updated?.title || formData.title,
            description: updated?.description ?? formData.description,
            discount: updated?.discount ?? formData.discount,
            validFrom: updated?.validFrom || formData.validFrom,
            validTo: updated?.validTo || formData.validTo,
            applicableCategories: updated?.applicableCategories || formData.applicableCategories,
            isActive: updated?.isActive ?? formData.isActive,
          });
          toast.success('Offer created successfully and saved to server');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#6B8E23] text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Offer' : 'Create New Offer'}</h2>
          <button onClick={onClose} className="hover:bg-[#5B7A1E] p-2 rounded transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Offer Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="e.g., Summer Sale - 30% Off"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="Describe the offer details"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Discount (%) *</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                placeholder="10"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Status</label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="text-gray-700">{formData.isActive ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Valid From *</label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Valid To *</label>
              <input
                type="date"
                name="validTo"
                value={formData.validTo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-3">Applicable Categories</label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-lg">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.applicableCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-[#6B8E23] text-white py-2 rounded-lg hover:bg-[#5B7A1E] transition font-semibold"
            >
              {initialData ? 'Update Offer' : 'Create Offer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      {editingOffer && (
        <AddOfferForm
          initialData={editingOffer}
          onClose={() => setEditingOffer(null)}
        />
      )}
    </div>
  );
}
