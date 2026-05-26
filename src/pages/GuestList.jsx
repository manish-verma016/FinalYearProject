import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Users, UserPlus, Mail, Phone, Trash2, X, Loader2, Share2, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { DEMO_GUESTS } from '../constants';

export default function GuestList() {
  const { user } = useAuth();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '' });
  const [activeVendors, setActiveVendors] = useState([]);
  const [sendingInvites, setSendingInvites] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'guests'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (fetchedGuests.length === 0) {
        const now = new Date().toISOString();
        setGuests(DEMO_GUESTS.map(g => ({ ...g, createdAt: now })));
      } else {
        setGuests(fetchedGuests);
      }
      setLoading(false);
    });

    const fetchVendors = async () => {
      try {
        const vq = query(collection(db, 'users'), where('role', '==', 'vendor'));
        const vSnapshot = await getDocs(vq);
        setActiveVendors(vSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Vendors fetch error:", err);
      }
    };

    fetchVendors();

    return () => unsubscribe();
  }, [user]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'guests'), {
        userId: user.uid,
        ...newGuest,
        status: 'invited',
        createdAt: serverTimestamp(),
      });
      setNewGuest({ name: '', email: '', phone: '' });
      setShowAddModal(false);
      toast.success('Guest added to the list!');
    } catch (error) {
      toast.error('Failed to add guest');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'guests', id));
      toast.success('Guest removed');
    } catch (error) {
      toast.error('Failed to remove guest');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'guests', id), { status });
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleSendInvitations = async () => {
    setSendingInvites(true);
    // Simulate sending invites
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSendingInvites(false);
    toast.success('Invitations & Greetings sent to all guests!');
  };

  const handleShareWithVendor = (vendorName) => {
    toast.success(`Guest list shared with ${vendorName}!`);
    setShowShareModal(false);
  };

  if (!user) return <div className="pt-32 text-center underline">Please sign in to manage your guest list</div>;

  const stats = [
    { label: 'Total Guests', value: guests.length, color: 'bg-blue-50 text-blue-600' },
    { label: 'Confirmed', value: guests.filter(g => g.status === 'confirmed').length, color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: guests.filter(g => g.status === 'pending' || g.status === 'invited').length, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="pt-32 pb-20 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shadow-2xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-2">Guest Management</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Coordinate your guest experience & vendor communication</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
           <button
            onClick={handleSendInvitations}
            disabled={sendingInvites || guests.length === 0}
            className="flex items-center justify-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-xs tracking-widest hover:bg-pink-600 transition-all shadow-xl disabled:opacity-50"
          >
            {sendingInvites ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>SEND GREETINGS</span>
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-bold text-xs tracking-widest hover:border-pink-200 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" /> <span>SHARE LIST</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 bg-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-xs tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-100"
          >
            <UserPlus className="w-4 h-4" /> <span>ADD GUEST</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <p className={cn("text-4xl font-black tracking-tighter", stat.color.split(' ')[1])}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-50 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Guest Identity</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Contact</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">RSVP Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                    <td colSpan={4} className="py-24 text-center">
                        <Loader2 className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
                    </td>
                </tr>
              ) : guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black italic text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {guest.name[0]}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 uppercase tracking-tight block leading-none mb-1">{guest.name}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{guest.side || 'Guest'} Side</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-gray-900 flex items-center uppercase"><Mail className="w-3 h-3 mr-3 text-pink-600" /> {guest.email}</p>
                      <p className="text-[10px] text-gray-400 font-black flex items-center tracking-widest"><Phone className="w-3 h-3 mr-3 text-pink-600" /> {guest.phone}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <select
                      value={guest.status}
                      onChange={(e) => updateStatus(guest.id, e.target.value)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl outline-none transition-all shadow-sm border border-transparent focus:border-pink-100",
                        guest.status === 'confirmed' ? "bg-green-50 text-green-600" :
                        guest.status === 'declined' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                      )}
                    >
                      <option value="invited">Invited</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="declined">Declined</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && guests.length === 0 && (
          <div className="py-24 text-center">
            <Users className="w-16 h-16 text-gray-100 mx-auto mb-6" />
            <h3 className="text-lg font-bold text-gray-900">Your Guest List is Empty</h3>
            <p className="text-gray-500 font-light mt-2">Start adding guests to stay organized!</p>
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full translate-x-16 -translate-y-16 blur-2xl opacity-50" />
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Register Guest</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Expand your celebration circle</p>
              </div>

              <form onSubmit={handleAddGuest} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Identity</label>
                  <input
                    required
                    type="text"
                    placeholder="Guest Name"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Protocol</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Telecom Access</label>
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-pink-600 transition-all shadow-2xl shadow-gray-100 mt-4 active:scale-95"
                >
                  Confirm Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-pink-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Share2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Share Insights</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Transmit guest list to vendors</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Verified Partners</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar focus:outline-none">
                  {activeVendors.length > 0 ? activeVendors.map(vendor => (
                    <button
                      key={vendor.id}
                      onClick={() => handleShareWithVendor(vendor.displayName)}
                      className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-pink-50 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                            <Users className="w-5 h-5 text-gray-400 group-hover:text-pink-600" />
                         </div>
                         <div className="text-left">
                            <p className="font-bold text-gray-900 text-sm group-hover:text-pink-600 transition-colors uppercase tracking-tight">{vendor.displayName}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{vendor.businessInfo?.category || 'Vendor'}</p>
                         </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-gray-200 group-hover:text-green-500" />
                    </button>
                  )) : (
                    <div className="p-8 text-center bg-gray-50 rounded-3xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No active vendors found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
