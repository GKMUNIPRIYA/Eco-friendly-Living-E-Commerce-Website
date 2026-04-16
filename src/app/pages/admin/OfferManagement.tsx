import { useState } from 'react';
import { useAdmin, Offer } from '../../context/AdminContext';
import { offersAPI } from '../../services/api';
import { Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import AddOfferForm from './AddOfferForm';

export default function OfferManagement() {
  const { offers, deleteOffer } = useAdmin();
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await offersAPI.delete(id);
      deleteOffer(id);
      toast.success('Offer deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete offer');
    }
  };

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">No offers created yet. Create your first offer to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#5B6F1E] mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-3">{offer.description}</p>

                <div className="flex items-center gap-6 mb-3">
                  <div className="bg-[#FFE5B4] px-4 py-2 rounded-lg">
                    <span className="text-2xl font-bold text-[#FF6B00]">{offer.discount}%</span>
                    <p className="text-sm text-gray-700">Discount</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Valid Period</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    {offer.isActive ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Inactive</span>
                      </div>
                    )}
                  </div>
                </div>

                {offer.applicableCategories.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Applicable Categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {offer.applicableCategories.map((cat) => (
                        <span key={cat} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingOffer(offer)}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit offer"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete offer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingOffer && (
        <AddOfferForm
          initialData={editingOffer}
          onClose={() => setEditingOffer(null)}
        />
      )}
    </>
  );
}
