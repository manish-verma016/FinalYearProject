import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, MapPin, CheckCircle2, ChevronRight, Search as SearchIcon, Loader2, X, ArrowRightLeft, Heart } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { cn, formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import BookingModal from '../components/BookingModal';

import { CATEGORIES } from '../constants';

export default function Services() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(500000);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedService, setSelectedService] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setFavorites(snap.data().favorites || []);
      }
    });
    return unsub;
  }, [user]);

  const toggleFavorite = async (serviceId) => {
    if (!user) {
      toast.error('Please sign in to shortlist services');
      return;
    }

    const isFav = favorites.includes(serviceId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        favorites: isFav ? arrayRemove(serviceId) : arrayUnion(serviceId)
      });
      toast.success(isFav ? 'Removed from shortlist' : 'Added to shortlist', {
        icon: isFav ? '🗑️' : '💖'
      });
    } catch (error) {
      toast.error('Failed to update shortlist');
    }
  };

  const locations = ['All', ...new Set(services.map(s => s.location))];

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl);
    }
    const qFromUrl = searchParams.get('q');
    if (qFromUrl) {
      setSearchQuery(qFromUrl);
    }
    const locFromUrl = searchParams.get('loc');
    if (locFromUrl) {
      setSelectedLocation(locFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'services'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const fetchedServices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setServices(fetchedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleBookingClick = (service) => {
    if (!user) {
      toast.error('Please sign in to book a service');
      return;
    }
    setSelectedService(service);
  };

  const toggleCompare = (service) => {
    setCompareList(prev => {
      if (prev.find(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      }
      if (prev.length >= 2) {
        toast.error('You can only compare 2 services at a time');
        return prev;
      }
      return [...prev, service];
    });
  };

  const filteredServices = services
    .filter(service => {
      const matchesCategory = activeCategory === 'All' || service.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           service.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = service.price <= maxPrice;
      const matchesLocation = selectedLocation === 'All' || service.location === selectedLocation;
      return matchesCategory && matchesSearch && matchesPrice && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.rating - a.rating;
    });

  const updateCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="pt-32 pb-20 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      <div className="text-center mb-16 px-4">
        <span className="text-pink-600 font-black uppercase tracking-[0.4em] text-[10px]">Our Offerings</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mt-4 tracking-tight font-serif">Wedding Services</h1>
        
        {/* Filters Bar */}
        <div className="mt-12 flex flex-col gap-6 max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => updateCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center px-6">
              <SearchIcon className="w-4 h-4 text-gray-400 mr-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-[10px] font-black uppercase tracking-widest"
              />
            </div>

            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center px-6">
              <MapPin className="w-4 h-4 text-gray-400 mr-4" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full py-3 bg-transparent text-gray-900 focus:outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer"
              >
                {locations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'Location' : loc}</option>)}
              </select>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center px-6">
              <SearchIcon className="w-4 h-4 text-gray-400 mr-4 rotate-90" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 bg-transparent text-gray-900 focus:outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer"
              >
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget: ₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                layout
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <span className="bg-white/90 backdrop-blur-md text-pink-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
                      {service.category}
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(service.id); }}
                      className={cn(
                        "w-8 h-8 rounded-lg backdrop-blur-md flex items-center justify-center transition-all shadow-sm",
                        favorites.includes(service.id) 
                          ? "bg-pink-600 text-white" 
                          : "bg-white/90 text-gray-400 hover:text-pink-600"
                      )}
                      title="Shortlist"
                    >
                      <Heart className={cn("w-3.5 h-3.5", favorites.includes(service.id) && "fill-current")} />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleCompare(service); }}
                      className={cn(
                        "w-8 h-8 rounded-lg backdrop-blur-md flex items-center justify-center transition-all",
                        compareList.find(s => s.id === service.id)
                          ? "bg-pink-600 text-white shadow-xl shadow-pink-200"
                          : "bg-black/20 text-white hover:bg-white hover:text-pink-600"
                      )}
                      title="Add to compare"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg">
                    <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-[10px] font-black text-gray-900">{service.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-pink-600 transition-colors uppercase tracking-widest leading-none truncate">
                        {service.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/vendor-profile/${service.vendorId}`}
                        className="text-[9px] text-gray-400 flex items-center hover:text-pink-600 transition-colors uppercase font-black tracking-widest"
                      >
                        {service.vendorName}
                        {service.verified && <CheckCircle2 className="w-3 h-3 text-pink-500 ml-1" />}
                      </Link>
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-pink-400" /> {service.location}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="text-[10px] text-gray-500 font-medium line-clamp-2 italic leading-relaxed">
                      "{service.description || 'Professional wedding services tailored for your special day.'}"
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(service.features || ['Best Quality', 'Premium']).slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-[7px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 px-2 py-1 rounded">
                          • {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[7px] text-gray-400 uppercase font-black tracking-[0.2em] mb-0.5">Starting From</p>
                      <p className="text-xl font-black text-pink-600 tracking-tighter">{formatCurrency(service.price)}</p>
                    </div>
                    <button
                      onClick={() => handleBookingClick(service)}
                      className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[9px] tracking-widest uppercase hover:bg-pink-600 transition-all flex items-center shadow-xl shadow-gray-100 group-hover:shadow-pink-200"
                    >
                      Reserve <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Comparison Drawer */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 rounded-[2.5rem] px-8 py-6 shadow-2xl flex items-center gap-12 z-50 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-black uppercase tracking-widest">{compareList.length} Selected</p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Compare Side by Side</p>
              </div>
            </div>

            <div className="flex gap-3">
              {compareList.map(s => (
                <div key={s.id} className="relative w-14 h-14">
                  <img src={s.images[0]} className="w-full h-full object-cover rounded-xl border border-white/20" />
                  <button
                    onClick={() => toggleCompare(s)}
                    className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {compareList.length < 2 && (
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20">
                  +
                </div>
              )}
            </div>

            <button
              disabled={compareList.length < 2}
              onClick={() => setShowComparison(true)}
              className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-pink-600 hover:text-white transition-all disabled:opacity-30"
            >
              Compare Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComparison(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[3.5rem] p-12 lg:p-16 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button 
                onClick={() => setShowComparison(false)}
                className="absolute top-8 right-8 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">Vendor Comparison</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Side-by-side analysis of your top picks</p>
              </div>

              <div className="grid grid-cols-2 gap-12">
                {compareList.map(item => (
                  <div key={item.id} className="space-y-12">
                    <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden">
                      <img src={item.images[0]} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-1">{item.category}</p>
                        <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{item.title}</h3>
                        <p className="text-sm text-gray-400 mt-2">By {item.vendorName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-2xl">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Price</p>
                          <p className="text-xl font-black text-pink-600">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Rating</p>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-2" />
                            <p className="text-xl font-black text-gray-900">{item.rating}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b pb-2">Key Features</p>
                        <ul className="space-y-3">
                          {item.features?.map(f => (
                            <li key={f} className="flex items-center text-xs text-gray-600 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-3" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => { setShowComparison(false); handleBookingClick(item); }}
                        className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-pink-600 transition-all shadow-xl shadow-gray-100"
                      >
                        Book This Vendor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedService && (
        <BookingModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {filteredServices.length === 0 && !loading && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Services Found</h3>
          <p className="text-gray-500 font-light mt-2">Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </div>
  );
}
