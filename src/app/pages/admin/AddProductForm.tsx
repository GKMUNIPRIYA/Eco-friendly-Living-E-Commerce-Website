import { useState } from 'react';
import { useAdmin, AdminProduct } from '../../context/AdminContext';
import { X, Upload, ImagePlus } from 'lucide-react';
import { categories } from '../../data/products';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export default function AddProductForm({ onClose }: Props) {
  const { addAdminProduct } = useAdmin();
  const [formData, setFormData] = useState<AdminProduct>({
    id: '',
    name: '',
    price: 0,
    image: '',
    category: '',
    description: '',
  });

  const [imageCount, setImageCount] = useState(1);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleImageCountChange = (count: number) => {
    setImageCount(count);
    setImageFiles((prev) => {
      const newFiles = [...prev];
      while (newFiles.length < count) newFiles.push(null);
      return newFiles.slice(0, count);
    });
  };

  const handleFileChange = (index: number, file: File | null) => {
    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill all required fields (name, price, category)');
      return;
    }

    const hasFiles = imageFiles.some((f) => f !== null);
    if (!hasFiles && !formData.image) {
      toast.error('Please upload at least one image or enter an image URL');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('price', String(formData.price));
      fd.append('category', formData.category);
      fd.append('description', formData.description);

      if (hasFiles) {
        imageFiles.forEach((file) => {
          if (file) fd.append('images', file);
        });
      } else if (formData.image) {
        fd.append('image', formData.image);
      }

      const adminToken = localStorage.getItem('adminToken') || '';
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { ...(adminToken && { Authorization: `Bearer ${adminToken}` }) },
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to add product');
      const created = json.data || json;

      addAdminProduct({
        id: created?._id || created?.id || Date.now().toString(),
        name: created?.name || formData.name,
        price: created?.price ?? formData.price,
        image: created?.image || formData.image,
        images: created?.images || [],
        category: created?.category || formData.category,
        description: created?.description ?? formData.description,
      });

      setFormData({ id: '', name: '', price: 0, image: '', category: '', description: '' });
      setImageFiles([null]);
      setImageCount(1);
      onClose();
      toast.success('Product added successfully!');
    } catch (error: any) {
      console.error('Failed to create product', error);
      toast.error(error?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header - does NOT scroll with content */}
        <div className="bg-[#6B8E23] text-white p-6 flex justify-between items-center rounded-t-lg flex-shrink-0">
          <h2 className="text-2xl font-bold">Add New Product</h2>
          <button onClick={onClose} className="hover:bg-[#5B7A1E] p-2 rounded transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Count Selector */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">
              <ImagePlus className="w-4 h-4 inline mr-1" />
              Number of Product Images *
            </label>
            <select
              value={imageCount}
              onChange={(e) => handleImageCountChange(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Image' : 'Images'}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Image Upload Fields */}
          <div className="space-y-3">
            {Array.from({ length: imageCount }).map((_, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Image {idx + 1} {idx === 0 && '(Primary)'}
                </label>
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#6B8E23] transition">
                  <div className="flex flex-col items-center">
                    <Upload className="w-5 h-5 text-gray-500 mb-1" />
                    <span className="text-sm text-gray-600">
                      {imageFiles[idx] ? imageFiles[idx]!.name : 'Click to upload image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {imageFiles[idx] && (
                  <div className="mt-2 relative">
                    <img
                      src={URL.createObjectURL(imageFiles[idx]!)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange(idx, null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* OR URL fallback (only when 1 image and no file) */}
          {imageCount === 1 && !imageFiles[0] && (
            <div>
              <p className="text-xs text-gray-400 text-center mb-2">— or enter image URL below —</p>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#6B8E23] text-white py-2 rounded-lg hover:bg-[#5B7A1E] transition font-semibold disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add Product'}
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
    </div>
  );
}
