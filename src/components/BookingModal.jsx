import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Phone, IndianRupee, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useNotifications } from '../lib/NotificationContext';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

export default function BookingModal({ service, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    contactNumber: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book');
      return;
    }

    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        serviceId: service.id,
        serviceTitle: service.title,
        vendorId: service.vendorId,
        vendorName: service.vendorName,
        date: formData.date,
        contactNumber: formData.contactNumber,
        status: 'pending',
        paymentStatus: 'unpaid',
        price: service.price,
        totalAmount: service.price,
        paidAmount: 0,
        createdAt: serverTimestamp(),
      });

      toast.success('Booking request sent successfully!');
      
      try {
        addNotification({
          title: 'New Booking Request Received 💍',
          message: `${user.displayName || user.email} requested to reserve your service "${service.title}" on ${formData.date}. Contact: ${formData.contactNumber}`,
          type: 'booking',
          recipientRole: 'vendor', // Notify the vendor and admin
          recipientUserId: service.vendorId || null,
          senderName: user.displayName || user.email,
          targetId: docRef.id,
          targetName: service.title,
          actionable: true,
          actionLabel: 'Accept & Hold Booking'
        });
      } catch (err) {
        console.error('Quietly swallow notification issue:', err);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to send booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="h-2 bg-pink-600" />

            <div className="p-10">
              <div className="mb-10">
                <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">Booking Flow</span>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic mt-4">Confirm Reservation</h2>
                <p className="text-sm text-gray-500 font-light mt-1">Review service details and provide your contact info.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service</p>
                    <p className="text-lg font-bold text-gray-900 line-clamp-1 italic uppercase tracking-tight">{service.title}</p>
                    <p className="text-xs text-gray-500 mt-1">By <span className="text-gray-900 font-semibold">{service.vendorName}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-pink-600">{formatCurrency(service.price)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
                  <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Verified Vendor
                  </div>
                  <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> 24h Response
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <Calendar className="w-3 h-3 mr-2 text-pink-400" /> Event Date
                  </label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-pink-500 focus:bg-white transition-all text-sm font-semibold text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <Phone className="w-3 h-3 mr-2 text-pink-400" /> Contact Number
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 00000 00000"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-pink-500 focus:bg-white transition-all text-sm font-semibold text-gray-900"
                  />
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center justify-center group shadow-2xl shadow-gray-100 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <IndianRupee className="w-4 h-4 mr-2" />
                        SEND BOOKING REQUEST
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-4 font-bold uppercase tracking-[0.2em]">Safe & Secure Transaction</p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
