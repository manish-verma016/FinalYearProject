import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Star, MapPin, Mail, Loader2, ArrowLeft, MessageSquare, Send, ChevronRight, ShieldCheck, Award } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../lib/AuthContext';
import { onSnapshot } from 'firebase/firestore';

export default function VendorProfile() {
  const { vendorId } = useParams();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [selectedService, setSelectedService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return;
      setLoading(true);
      try {
        const vendorDoc = await getDoc(doc(db, 'users', vendorId));
        if (vendorDoc.exists()) {
          setVendor({ uid: vendorDoc.id, ...vendorDoc.data() });
        }

        const q = query(collection(db, 'services'), where('vendorId', '==', vendorId), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        setServices(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();

    // Listen for reviews
    const reviewsQuery = query(collection(db, 'reviews'), where('vendorId', '==', vendorId));
    const unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    return () => unsubReviews();
  }, [vendorId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in to review");
    if (!newReview.comment.trim()) return toast.error("Write something first");

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        vendorId,
        userId: user.uid,
        userName: user.displayName,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      });
      toast.success("Review posted!");
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      toast.error("Failed to post review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to send an enquiry.");
      return;
    }
    
    const t = toast.loading("Transmitting enquiry...");
    try {
      await addDoc(collection(db, 'enquiries'), {
        vendorId: vendor.uid,
        vendorName: vendor.displayName,
        userId: user.uid,
        userName: contactForm.name,
        userEmail: contactForm.email,
        message: contactForm.message,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      toast.success("Enquiry transmitted! The vendor will be notified.", { id: t });
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error("Failed to send enquiry", { id: t });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-pink-600 animate-spin" /></div>;
  if (!vendor) return <div className="pt-32 text-center text-gray-500 font-bold">Vendor Not Found</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '4.8';

  const starsDistribution = [5, 4, 3, 2, 1].map(sVal => {
    const count = reviews.filter(r => Math.round(r.rating) === sVal).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { rating: sVal, count, pct };
  });

  const expertiseList = vendor.expertise || ['Wedding specialist', 'Event coordination', 'Premium hospitality'];

  return (
    <div className="pt-32 pb-20 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      <Link to="/services" className="inline-flex items-center text-[10px] font-black text-gray-400 hover:text-pink-600 mb-12 transition-all uppercase tracking-[0.2em] group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Explorations
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          {/* Main Profile Header */}
          <div className="bg-white p-12 lg:p-16 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-50" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="relative group">
                   <div className="absolute -inset-2 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-[3rem] opacity-20 group-hover:opacity-40 transition-opacity blur-lg" />
                   <img
                     src={vendor.photoURL || `https://ui-avatars.com/api/?name=${vendor.displayName}&background=fdf2f8&color=db2777&bold=true`}
                     alt={vendor.displayName}
                     className="w-48 h-48 rounded-[2.5rem] object-cover relative z-10 border-4 border-white shadow-xl shadow-gray-100"
                     referrerPolicy="no-referrer"
                   />
                   {vendor.verified && (
                     <div className="absolute -bottom-3 -right-3 bg-pink-600 text-white p-3 rounded-2xl shadow-2xl z-20">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                   )}
                </div>

                <div className="text-center md:text-left flex-1">
                   <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                      <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">{vendor.displayName}</h1>
                      <div className="flex items-center bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-100">
                         <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Professional Host</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 border-y border-gray-50 py-8">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Experience</p>
                        <p className="text-lg font-black text-gray-900">{vendor.experience || 5}+ Years</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-405 mr-2" />
                          <p className="text-lg font-black text-gray-900">{averageRating}</p>
                          <span className="text-[10px] text-gray-400 font-bold ml-1">({reviews.length})</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Bookings</p>
                        <p className="text-lg font-black text-gray-900">{vendor.totalBookings || 86}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                        <p className="text-lg font-black text-gray-900 uppercase">Aligarh</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <button className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-pink-600 transition-all shadow-2xl shadow-gray-100">Request Custom Quote</button>
                      <button className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-all"><MessageSquare className="w-6 h-6" /></button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-12">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Signature Services</h2>
                <div className="h-px bg-gray-100 flex-1 ml-8" />
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                {services.map(s => (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
                  >
                     <div className="h-56 overflow-hidden relative">
                        <img src={s.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-sm flex items-center">
                           <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-2" />
                           <span className="text-[10px] font-black text-gray-900">{s.rating || 4.8}</span>
                        </div>
                     </div>
                     <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-none">{s.title}</h3>
                           <p className="text-lg font-black text-pink-600 leading-none">{formatCurrency(s.price)}</p>
                        </div>
                        <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed italic mb-8">"{s.description}"</p>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                           {s.features?.slice(0, 3).map(f => (
                             <span key={f} className="text-[9px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1 rounded-lg"># {f}</span>
                           ))}
                        </div>

                        <button 
                          onClick={() => setSelectedService(s)}
                          className="w-full h-16 bg-gray-50 group-hover:bg-gray-900 group-hover:text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center"
                        >
                          Select This Experience <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-12" id="customer-reviews-ratings-section">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Client Testimonials & Ratings</h2>
                <div className="h-px bg-gray-100 flex-1 ml-8" />
             </div>

             <div className="grid gap-8">
                {/* Dynamic Ratings breakdown & score card */}
                <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm grid md:grid-cols-12 gap-8 items-center" id="reviews-summary-scorecard">
                   <div className="md:col-span-5 text-center md:border-r md:border-gray-100 md:pr-8">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Average Rating Score</p>
                      <h3 className="text-6.5xl font-black text-gray-950 tracking-tighter leading-none font-mono my-2">{averageRating}</h3>
                      <div className="flex justify-center my-3.5 space-x-1">
                         {[...Array(5)].map((_, idx) => (
                            <Star 
                               key={idx} 
                               className={cn(
                                  "w-5.5 h-5.5", 
                                  idx < Math.round(Number(averageRating)) ? "text-yellow-400 fill-yellow-400" : "text-gray-150"
                               )} 
                            />
                         ))}
                      </div>
                      <p className="text-[10px] font-black uppercase text-pink-600 tracking-wider">
                         Based on {reviews.length} authentic wedding {reviews.length === 1 ? 'review' : 'reviews'}
                      </p>
                   </div>
                   <div className="md:col-span-7 space-y-2.5">
                      {starsDistribution.map(item => (
                         <div key={item.rating} className="flex items-center text-xs">
                            <span className="w-14 font-black text-gray-400 uppercase tracking-widest text-[9px] text-left">
                               {item.rating} Stars
                            </span>
                            <div className="flex-1 h-2.5 bg-gray-50 rounded-full overflow-hidden mx-4 border border-gray-100">
                               <div 
                                  className="h-full bg-pink-500 rounded-full transition-all duration-300" 
                                  style={{ width: `${item.pct}%` }} 
                               />
                            </div>
                            <span className="w-10 text-right font-black text-gray-900 font-mono text-[10px]">
                               {item.count} ({item.pct}%)
                            </span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Post a Review */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                   <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8">Share your experience</h3>
                   <form onSubmit={handleReviewSubmit} className="space-y-6">
                      <div className="flex space-x-2">
                         {[1, 2, 3, 4, 5].map((star) => (
                            <button
                               key={star}
                               type="button"
                               onClick={() => setNewReview({ ...newReview, rating: star })}
                               className="focus:outline-none transition-transform hover:scale-125"
                            >
                               <Star className={cn("w-8 h-8", newReview.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
                            </button>
                         ))}
                      </div>
                      <textarea
                         rows={3}
                         value={newReview.comment}
                         onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                         placeholder="Your review helps others plan their big day better..."
                         className="w-full p-8 bg-gray-50 rounded-[2.5rem] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                      />
                      <button 
                         disabled={isSubmittingReview}
                         className="w-full bg-gray-900 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-pink-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                      >
                         {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Post Testimonial"}
                      </button>
                   </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                   {reviews.length > 0 ? (
                      reviews.map((review) => (
                         <motion.div 
                           key={review.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm"
                         >
                            <div className="flex items-center justify-between mb-6">
                               <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400">
                                     {review.userName?.[0]}
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{review.userName}</p>
                                     <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                           <Star key={i} className={cn("w-2.5 h-2.5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
                                        ))}
                                     </div>
                                  </div>
                               </div>
                               <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                  {review.createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium italic leading-relaxed">"{review.comment}"</p>
                         </motion.div>
                      ))
                   ) : (
                      <p className="text-center py-20 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] italic">Be the first to leave a review</p>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Bio & Expertise */}
        <div className="space-y-10">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8 border-b border-gray-50 pb-4">Areas of Expertise</h3>
              <div className="space-y-4">
                 {expertiseList.map(item => (
                   <div key={item} className="flex items-center p-5 bg-gray-50 rounded-[1.5rem] group hover:bg-pink-50 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 mr-4 group-hover:border-pink-200">
                        <Award className="w-5 h-5 text-pink-600" />
                      </div>
                      <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{item}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gray-900 rounded-[3.5rem] p-10 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full translate-x-16 -translate-y-16 blur-3xl opacity-30" />
              <h3 className="text-2xl font-black mb-8 italic">Direct Enquiry</h3>
              <form onSubmit={handleContact} className="space-y-6 relative z-10">
                 <input
                   required
                   value={contactForm.name}
                   onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                   placeholder="Your Name"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-pink-500 transition-all font-medium text-sm text-white"
                 />
                 <input
                   required
                   type="email"
                   value={contactForm.email}
                   onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                   placeholder="Email Address"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-pink-500 transition-all font-medium text-sm text-white"
                 />
                 <textarea
                   required
                   rows={4}
                   value={contactForm.message}
                   onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                   placeholder="What are the specific requirements for your big day?"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-pink-500 transition-all font-medium text-sm text-white resize-none"
                 />
                 <button className="w-full bg-pink-600 text-white h-16 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center hover:bg-pink-700 transition-all shadow-xl shadow-pink-500/20">
                   <Send className="w-4 h-4 mr-2" /> Send Message
                 </button>
              </form>
           </div>
        </div>
      </div>

      {selectedService && (
        <BookingModal
          service={{ ...selectedService, vendorName: vendor.displayName, vendorId: vendor.uid }}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
