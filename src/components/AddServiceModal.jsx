import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Upload, Trash2, Loader2, Sparkles, MapPin, IndianRupee } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useNotifications } from '../lib/NotificationContext';
import toast from 'react-hot-toast';

export default function AddServiceModal({ isOpen, onClose, onSuccess, initialData }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    serviceId: initialData?.serviceId || '',
    category: initialData?.category || 'Pandit',
    price: initialData?.price || '',
    features: initialData?.features?.join(', ') || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
  });

  const categories = ['Pandit', 'DJ', 'Decoration', 'Catering', 'Photography', 'Astrology'];

  const handleAddImage = () => {
    if (!newImageUrl) return;
    setImages([...images, newImageUrl]);
    setNewImageUrl('');
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const serviceData = {
        vendorId: user.uid,
        vendorName: user.displayName || 'Vendor',
        title: formData.title,
        serviceId: formData.serviceId,
        category: formData.category,
        price: Number(formData.price),
        location: formData.location,
        description: formData.description,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
        status: initialData ? initialData.status : 'pending',
        rating: initialData ? initialData.rating : 4.5,
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'services', initialData.id), serviceData);
        toast.success('Service updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'services'), {
          ...serviceData,
          createdAt: serverTimestamp(),
        });
        toast.success('Service submitted for approval!');

        try {
          addNotification({
            title: 'New Service Created Pending Approval 🛠️',
            message: `Vendor "${user.displayName || 'Vendor'}" requested listing approval for a new service: "${formData.title}" starting at ₹${formData.price}.`,
            type: 'service',
            recipientRole: 'admin', // Notify the admin
            senderName: user.displayName || 'Vendor',
            targetId: docRef.id,
            targetName: formData.title,
            actionable: true,
            actionLabel: 'Verify & Activate Listing'
          });
        } catch (err) {
          console.error('Quietly swallow notification issue:', err);
        }
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save service:', error);
      toast.error('Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">{initialData ? 'Edit Service' : 'List New Service'}</h2>
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em]">{initialData ? 'Update your listing' : 'Vendor Onboarding'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar text-left">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Service Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Royal Wedding Photography"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-16 px-8 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-700 outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Service Type (ID)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. photography-pkg-1"
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="w-full h-16 px-8 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-16 px-8 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-700 outline-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Base Price (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="number"
                      placeholder="50000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full h-16 pl-14 pr-8 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Service Images</label>
                <div className="flex flex-wrap gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-32 h-32 rounded-3xl overflow-hidden group border border-gray-100">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-pink-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                          Cover
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1 bg-gray-900/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2 w-full md:w-auto">
                    <input
                      type="url"
                      placeholder="Paste Image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 md:w-64 h-16 px-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl focus:border-pink-300 outline-none text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="h-16 px-8 bg-gray-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-100"
                    >
                      Add Image
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest italic">Add multiple URLs. The first image will be featured as the primary listing photo.</p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Features (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Professional Service, Verified Vendor, Best Price"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full h-16 px-8 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-700 outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Location (City)</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="text"
                    placeholder="Aligarh, New Delhi, etc."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-16 pl-14 pr-8 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-700 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your service in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-8 bg-gray-50 border border-transparent rounded-[2.5rem] focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-700 outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-20 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-pink-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center group"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3 text-pink-400 group-hover:rotate-12 transition-transform" />
                      {initialData ? 'Update Service' : 'List Service for Approval'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
