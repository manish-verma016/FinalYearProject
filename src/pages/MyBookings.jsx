import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  Calendar, 
  XCircle, 
  Loader2, 
  Heart, 
  Wallet, 
  Sparkles, 
  ChevronRight, 
  Star, 
  Printer, 
  Download,
  Clock,
  LayoutDashboard,
  PieChart as ChartIcon
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PRIMARY_VENUES } from '../data/venuesData';

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 pb-4 transition-all relative",
        active ? "text-pink-600" : "text-gray-400 hover:text-gray-600"
      )}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      {count !== undefined && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[8px] font-black",
          active ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-400"
        )}>
          {count}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600 rounded-full"
        />
      )}
    </button>
  );
}

function EmptyState({ icon: Icon, label, sub }) {
  return (
    <div className="bg-white p-20 rounded-[3rem] border border-gray-50 border-dashed flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-300" />
      </div>
      <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic mb-2">{label}</h4>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{sub}</p>
    </div>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(null);
  const [budget, setBudget] = useState(1000000); 
  const [activeTab, setActiveTab] = useState('bookings');
  const [astroResults, setAstroResults] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [likedInspirations, setLikedInspirations] = useState([]);
  const [sentEnquiries, setSentEnquiries] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Bookings Subscriber
    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
    const unsubscribeBookings = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(fetchedBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    // Astro Results Subscriber
    const qAstro = query(collection(db, 'astro_results'), where('userId', '==', user.uid));
    const unsubscribeAstro = onSnapshot(qAstro, (snapshot) => {
      setAstroResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Saved Plans Subscriber
    const qPlans = query(collection(db, 'itineraries'), where('userId', '==', user.uid));
    const unsubscribePlans = onSnapshot(qPlans, (snapshot) => {
      setSavedPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Liked Inspirations Subscriber
    const qLikes = query(collection(db, 'user_likes'), where('userId', '==', user.uid), where('type', '==', 'inspiration'));
    const unsubLikes = onSnapshot(qLikes, (snapshot) => {
      setLikedInspirations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data().data })));
    });

    // Enquiries Subscriber
    const qEnq = query(collection(db, 'enquiries'), where('userId', '==', user.uid));
    const unsubEnq = onSnapshot(qEnq, (snapshot) => {
      setSentEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Profile Subscriber
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.budget) setBudget(data.budget);
        
        if (data.favorites && data.favorites.length > 0) {
           const favs = [];
           for (const id of data.favorites) {
             const matchedVenue = PRIMARY_VENUES.find(v => v.id === id);
             if (matchedVenue) {
               favs.push({
                 id: matchedVenue.id,
                 title: matchedVenue.title,
                 rating: matchedVenue.rating,
                 category: 'Venue',
                 images: [matchedVenue.image]
               });
             } else {
               const sDoc = await getDoc(doc(db, 'services', id));
               if (sDoc.exists()) favs.push({ id: sDoc.id, ...sDoc.data() });
             }
           }
           setFavorites(favs);
        } else {
           setFavorites([]);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeAstro();
      unsubscribePlans();
      unsubLikes();
      unsubEnq();
      unsubProfile();
    };
  }, [user]);

  const handlePay = async (booking) => {
    const toastId = toast.loading('Initiating Payment...');
    
    // Check if it's a mock booking (starts with 'd')
    const isMock = booking.id.startsWith('d');

    setTimeout(async () => {
      if (!isMock) {
        try {
          await updateDoc(doc(db, 'bookings', booking.id), { status: 'confirmed' });
        } catch (error) {
          console.error("Payment update failed:", error);
          toast.error("Process failed. Please try again.");
          toast.dismiss(toastId);
          return;
        }
      } else {
        // Just update local state for mock feel
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'confirmed' } : b));
      }
      
      toast.dismiss(toastId);
      toast.success('Payment Received! Booking Confirmed.');
    }, 2000);
  };

  const spent = bookings.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + b.price, 0);
  const upcomingCount = bookings.filter(b => b.status === 'confirmed').length;

  if (!user) return <div className="pt-40 text-center font-bold text-gray-400">Please sign in to view your dashboard.</div>;

  return (
    <div className="pt-32 pb-20 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      {/* Dashboard Stats */}
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 bg-gray-900 rounded-[3.5rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
           <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600 rounded-full translate-x-32 -translate-y-48 blur-[100px] opacity-40" />
           <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                 <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                      <Wallet className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black tracking-tighter italic uppercase leading-none mb-1">Your Wedding Budget</h2>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financial Overview</p>
                    </div>
                 </div>
                 <Link 
                   to="/budget"
                   className="px-5 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:scale-[1.03] duration-150 inline-flex items-center gap-1.5 self-start sm:self-auto"
                 >
                   Detailed Tracker <Sparkles className="w-4 h-4 text-white" />
                 </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Initial Budget</p>
                    <div className="flex items-center group">
                       <p className="text-4xl font-black tracking-tighter truncate">{formatCurrency(budget)}</p>
                       <button 
                         onClick={() => {
                           const newBudget = prompt('Enter your new total wedding budget:', budget.toString());
                           if (newBudget && !isNaN(Number(newBudget))) {
                             updateDoc(doc(db, 'users', user.uid), { budget: Number(newBudget) });
                             setBudget(Number(newBudget));
                             toast.success('Budget updated successfully');
                           }
                         }}
                         className="ml-4 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <span className="text-[9px] font-black uppercase">Edit</span>
                       </button>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Total Spent</p>
                          <p className="text-2xl font-black tracking-tight">{formatCurrency(spent)}</p>
                       </div>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{Math.round((spent/budget)*100)}% Used</p>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(budget > 0 ? (spent/budget)*100 : 0, 100)}%` }}
                         className="h-full bg-pink-600"
                       />
                    </div>
                    {/* Visual Breakdown */}
                    <div className="h-20 w-full mt-4">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie
                               data={[
                                 { name: 'Spent', value: spent },
                                 { name: 'Remaining', value: Math.max(budget - spent, 0) }
                               ]}
                               innerRadius={25}
                               outerRadius={35}
                               paddingAngle={5}
                               dataKey="value"
                             >
                                <Cell fill="#E50478" />
                                <Cell fill="rgba(255,255,255,0.1)" />
                             </Pie>
                             <Tooltip 
                               contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                               itemStyle={{ color: '#fff' }}
                             />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[3.5rem] p-10 flex flex-col justify-between border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full translate-x-16 -translate-y-16 blur-2xl opacity-50 group-hover:scale-125 transition-transform" />
           <div>
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter italic uppercase leading-none mb-1">Wedding Hub</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-black">Plan & Coordinate</p>
           </div>
           <div className="mt-8 space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                 <span className="text-[10px] font-black text-gray-400 uppercase">Confirmed Bookings</span>
                 <span className="text-sm font-black text-gray-900">{upcomingCount}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl">
                 <span className="text-[10px] font-black text-gray-400 uppercase">Saved Plans</span>
                 <span className="text-sm font-black text-gray-900">{savedPlans.length}</span>
              </div>
              <Link 
                to="/astro-tools" state={{ tab: 'calendar' }}
                className="flex justify-between items-center bg-pink-50/40 hover:bg-pink-50 p-3 rounded-2xl transition-all border border-pink-100/40 group cursor-pointer"
              >
                 <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-2">
                   <Calendar className="w-4 h-4 shrink-0" /> Auspicious Calendar
                 </span>
                 <span className="text-xs font-black text-pink-600 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
           </div>
        </div>
      </div>

      <div className="flex space-x-8 border-b border-gray-100 mb-12 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2">
        <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} label="My Bookings" count={bookings.length} />
        <TabButton active={activeTab === 'astro'} onClick={() => setActiveTab('astro')} label="Cosmic Readings" count={astroResults.length} />
        <TabButton active={activeTab === 'itineraries'} onClick={() => setActiveTab('itineraries')} label="Wedding Plans" count={savedPlans.length} />
        <TabButton active={activeTab === 'inspirations'} onClick={() => setActiveTab('inspirations')} label="Mood Board" count={likedInspirations.length} />
        <TabButton active={activeTab === 'enquiries'} onClick={() => setActiveTab('enquiries')} label="Enquiries" count={sentEnquiries.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' && (
              <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                 {loading ? (
                   <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-pink-600 animate-spin" /></div>
                 ) : bookings.length > 0 ? (
                   bookings.map((booking) => (
                     <motion.div
                       key={booking.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-8"
                     >
                        <div className="flex items-center space-x-6">
                           <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl italic border border-gray-100 group-hover:scale-110 transition-transform">
                             {booking.serviceTitle[0]}
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-pink-600 transition-colors leading-none mb-2">{booking.serviceTitle}</h4>
                              <div className="flex flex-wrap gap-4 items-center">
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center"><Calendar className="w-3 h-3 mr-2" /> {formatDate(booking.date)}</span>
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{booking.vendorName}</span>
                                 <span className={cn(
                                   "px-3 py-1 rounded-full text-[9px] font-black uppercase",
                                   booking.status === 'confirmed' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                 )}>{booking.status}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                              <p className="text-xl font-black text-gray-900 tracking-tighter">{formatCurrency(booking.price || booking.totalAmount)}</p>
                           </div>
                           {booking.status === 'pending' ? (
                             <div className="flex flex-col items-end">
                               <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2 italic px-4 py-1.5 bg-orange-50 rounded-full border border-orange-100">Pending</span>
                               <button disabled className="bg-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">Pay Now</button>
                             </div>
                           ) : booking.status === 'confirmed' ? (
                             <button onClick={() => setShowReceipt(booking)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-pink-600 transition-all focus:outline-none flex items-center justify-center" title="Download Receipt">
                               <Download className="w-5 h-5" />
                             </button>
                           ) : (
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-4 py-2 bg-gray-100 rounded-xl">Cancelled</span>
                           )}
                        </div>
                     </motion.div>
                   ))
                 ) : (
                   <EmptyState icon={Calendar} label="No Bookings Yet" sub="Explore our services to start booking." />
                 )}
              </motion.div>
            )}

            {activeTab === 'astro' && (
              <motion.div key="astro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                 {astroResults.length > 0 ? (
                   astroResults.map((result) => (
                     <div key={result.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                                 {result.type === 'match' ? <Heart className="w-6 h-6 text-pink-600" /> : <Sparkles className="w-6 h-6 text-pink-600" />}
                              </div>
                              <div>
                                 <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter italic leading-none">{result.type === 'match' ? 'Match Alignment' : 'Muhurut Found'}</h4>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formatDate(result.createdAt?.toDate ? result.createdAt.toDate() : result.createdAt)}</p>
                              </div>
                           </div>
                           <span className="text-2xl font-black text-pink-600 italic tracking-tighter">
                             {result.data.score ? `${result.data.score}/36` : result.data.dates?.length + ' Dates'}
                           </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium italic mb-6 leading-relaxed">
                          "{result.data.verdict || result.data.dates?.[0]?.date}"
                        </p>
                        <Link 
                          to="/astro-tools" 
                          className="text-[9px] font-black text-pink-600 uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform"
                        >
                          View Full Cosmic Report <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                     </div>
                   ))
                 ) : (
                   <EmptyState icon={Heart} label="No Cosmic Readings" sub="Visit Astro Tools for celestial guidance." />
                 )}
              </motion.div>
            )}

            {activeTab === 'itineraries' && (
              <motion.div key="itineraries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                 {savedPlans.length > 0 ? (
                   savedPlans.map((plan) => (
                     <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic group-hover:text-pink-600 transition-colors leading-none mb-2">{plan.style} Wedding</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{plan.guestCount} Guests • {plan.budgetRange} Budget</p>
                           </div>
                           <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
                             <Calendar className="w-5 h-5" />
                           </div>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium line-clamp-2 mb-6 italic opacity-60">
                           {plan.content.substring(0, 150)}...
                        </div>
                        <Link 
                          to="/ai-planner" 
                          className="text-[9px] font-black text-pink-600 uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform"
                        >
                          Open Planner <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                     </div>
                   ))
                 ) : (
                   <EmptyState icon={Sparkles} label="No Plans Generated" sub="Try our AI Wedding Planner." />
                 )}
              </motion.div>
            )}
            {activeTab === 'inspirations' && (
              <motion.div key="inspirations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {likedInspirations.length > 0 ? (
                   likedInspirations.map((item, idx) => (
                     <div key={idx} className="relative aspect-[3/4] rounded-[2rem] overflow-hidden group">
                        <img src={item.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button className="bg-pink-600 text-white p-3 rounded-full"><Heart className="w-4 h-4 fill-current" /></button>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="col-span-full">
                     <EmptyState icon={Sparkles} label="Empty Mood Board" sub="Heart some inspirations to see them here." />
                   </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'enquiries' && (
              <motion.div key="enquiries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                 {sentEnquiries.length > 0 ? (
                   sentEnquiries.map((enquiry) => (
                     <div key={enquiry.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-1 italic">To: {enquiry.vendorName}</p>
                              <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">{enquiry.vendorName}</h4>
                           </div>
                           <span className={cn(
                             "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                             enquiry.status === 'new' ? "bg-pink-50 text-pink-600" : "bg-gray-50 text-gray-400"
                           )}>
                             {enquiry.status}
                           </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium italic mb-6 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          "{enquiry.message}"
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                           <span>Sent on {formatDate(enquiry.createdAt?.toDate ? enquiry.createdAt.toDate() : enquiry.createdAt)}</span>
                           <Link to={`/vendor-profile/${enquiry.vendorId}`} className="text-pink-600 hover:underline">View Vendor</Link>
                        </div>
                     </div>
                   ))
                 ) : (
                   <EmptyState icon={Clock} label="No Enquiries" sub="Reach out to vendors on their profile pages." />
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Favorites Sidebar */}
        <div className="space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Shortlisted</h3>
              <Heart className="w-5 h-5 text-pink-600" />
           </div>

           <div className="space-y-4">
              {favorites.length > 0 ? (
                favorites.map(fav => (
                  <Link 
                    key={fav.id}
                    to={`/services`} 
                    className="block bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-lg transition-all group"
                  >
                     <div className="flex items-center space-x-6">
                        <img src={fav.images[0]} className="w-16 h-16 rounded-2xl object-cover" />
                        <div>
                           <p className="font-bold text-gray-900 uppercase tracking-tighter group-hover:text-pink-600 transition-colors leading-none mb-1">{fav.title}</p>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{fav.category}</p>
                           <div className="flex items-center mt-2">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1.5" />
                              <span className="text-[10px] font-bold text-gray-900">{fav.rating}</span>
                           </div>
                        </div>
                     </div>
                  </Link>
                ))
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] p-10 text-center">
                   <Heart className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">No services shortlisted yet.</p>
                </div>
              )}

              <Link 
                to="/services" 
                className="flex items-center justify-between w-full p-6 bg-[#E50478] text-white rounded-[2rem] group hover:opacity-90 transition-all shadow-xl shadow-pink-100"
              >
                 <span className="font-black uppercase tracking-widest text-[10px]">Find Vendors</span>
                 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
      
      {/* Receipt Modal (simplified copy of existing) */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-[3.5rem] p-12 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600 rounded-full translate-x-16 -translate-y-16 blur-2xl opacity-40" />
               <button onClick={() => setShowReceipt(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900"><XCircle className="w-8 h-8" /></button>
               
               <Heart className="w-12 h-12 text-pink-600 fill-pink-600 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Payment Receipt</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 mb-12">Transaction Confirmed</p>
               
               <div className="space-y-4 mb-12">
                  <div className="flex justify-between text-sm py-4 border-b border-gray-50">
                    <span className="text-gray-400 uppercase font-black text-[9px] tracking-widest">Service</span>
                    <span className="font-bold text-gray-900 uppercase">{showReceipt.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between text-sm py-4 border-b border-gray-50">
                    <span className="text-gray-400 uppercase font-black text-[9px] tracking-widest">Total Price</span>
                    <span className="font-black text-pink-600 text-lg">{formatCurrency(showReceipt.price)}</span>
                  </div>
               </div>

               <button 
                 onClick={() => window.print()}
                 className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center hover:bg-pink-600 transition-all"
               >
                 <Printer className="w-4 h-4 mr-2" /> Print Receipt
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
