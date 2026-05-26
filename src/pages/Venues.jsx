import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Heart, ChevronLeft, ChevronRight, Phone, MessageSquare, 
  X, CheckCircle2, Star, Users, ArrowRight, Loader2, Award, Gift, Calendar
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
import { cn, formatCurrency } from '../lib/utils';
import BookingModal from '../components/BookingModal';

const CITIES = [
  { name: 'Hyderabad', count: 452, image: 'https://images.unsplash.com/photo-1605007493699-af44834b5ae1?auto=format&fit=crop&q=80&w=400' },
  { name: 'Bangalore', count: 784, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=400' },
  { name: 'Mumbai', count: 954, image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=400' },
  { name: 'Chennai', count: 349, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=400' },
  { name: 'Delhi NCR', count: 2006, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=400' },
  { name: 'Lucknow', count: 503, image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=400' },
  { name: 'Kolkata', count: 289, image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=400' },
  { name: 'Jaipur', count: 612, image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400' }
];

export const PRIMARY_VENUES = [
  {
    id: 'venue_siri_natures',
    title: "Siri Nature's Valley Resort",
    city: 'Hyderabad',
    subLocation: 'Shamshabad, Hyderabad',
    rating: 4.8,
    reviewsCount: 32,
    price: 1000,
    capacity: "20 to 2000",
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: '1 promotion -10%'
  },
  {
    id: 'venue_hilton_genome',
    title: "Hilton Hyderabad Genome Valley Resort & Spa",
    city: 'Hyderabad',
    subLocation: 'Shamirpet, Hyderabad',
    rating: 5.0,
    reviewsCount: 42,
    price: 5000,
    capacity: "50 to 1000",
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: '1 promotion -10%'
  },
  {
    id: 'venue_environ_courtyard',
    title: "The Environ® - Courtyard Convention",
    city: 'Hyderabad',
    subLocation: 'Shamshabad, Hyderabad',
    rating: 5.0,
    reviewsCount: 4,
    price: 1500,
    capacity: "400 to 3000",
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: '1 promotion -5%'
  },
  {
    id: 'venue_marriott_apartments',
    title: "Marriot Executive Apartments Hyderabad",
    city: 'Hyderabad',
    subLocation: 'Gachibowli, Hyderabad',
    rating: 4.7,
    reviewsCount: 15,
    price: 1800,
    capacity: "30 to 300",
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
    tag: 'PREMIUM',
    promo: '1 promotion -30%'
  },
  {
    id: 'venue_amita_rasa',
    title: "Amita Rasa",
    city: 'Bangalore',
    subLocation: 'Nandi Hills, Bangalore',
    rating: 4.9,
    reviewsCount: 28,
    price: 250000,
    capacity: "300 to 1500",
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: '1 promotion -15%'
  },
  {
    id: 'venue_big_banyan',
    title: "Big Banyan Vineyard & Resort",
    city: 'Bangalore',
    subLocation: 'Mysore Road, Bangalore',
    rating: 4.6,
    reviewsCount: 19,
    price: 1500,
    capacity: "25 to 3000",
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: '1 promotion -5%'
  },
  {
    id: 'venue_kings_meadows',
    title: "The Kings Meadows",
    city: 'Bangalore',
    subLocation: 'Hebbal, Bangalore',
    rating: 4.8,
    reviewsCount: 8,
    price: 2000,
    capacity: "250 to 2000",
    image: 'https://images.unsplash.com/photo-1505232458729-415220485a95?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: '1 promotion -5%'
  },
  {
    id: 'venue_eagleton_golf',
    title: "Eagleton The Golf Resort",
    city: 'Bangalore',
    subLocation: 'Mysore Road - Kengeri, Bangalore',
    rating: 4.5,
    reviewsCount: 22,
    price: 2200,
    capacity: "100 to 1000",
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: 'No current offer'
  },
  {
    id: 'venue_taj_mahal_mumbai',
    title: "The Taj Mahal Palace",
    city: 'Mumbai',
    subLocation: 'Colaba, Mumbai',
    rating: 5.0,
    reviewsCount: 112,
    price: 7500,
    capacity: "100 to 1500",
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    tag: 'PREMIUM',
    promo: 'Exclusive package'
  },
  {
    id: 'venue_leela_mumbai',
    title: "The Leela Mumbai",
    city: 'Mumbai',
    subLocation: 'Andheri East, Mumbai',
    rating: 4.8,
    reviewsCount: 56,
    price: 3500,
    capacity: "50 to 1200",
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: '1 promotion -10%'
  },
  {
    id: 'venue_taj_lucknow',
    title: "Taj Mahal Lucknow",
    city: 'Lucknow',
    subLocation: 'Gomti Nagar, Lucknow',
    rating: 4.9,
    reviewsCount: 68,
    price: 450000,
    capacity: "100 to 1200",
    image: 'https://images.unsplash.com/photo-1543968332-f99478b1ebdc?auto=format&fit=crop&q=80&w=800',
    tag: 'PREMIUM',
    promo: '1 promotion -10%',
    vendorId: 'vendor_taj_lucknow',
    vendorName: 'Taj Hotels Group'
  },
  {
    id: 'venue_renaissance_lucknow',
    title: "Renaissance Lucknow Hotel",
    city: 'Lucknow',
    subLocation: 'Vipin Khand, Lucknow',
    rating: 4.7,
    reviewsCount: 39,
    price: 300000,
    capacity: "50 to 600",
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: 'Free Astro Muhurat session',
    vendorId: 'vendor_renaissance_lko',
    vendorName: 'Renaissance Marriott Group'
  },
  {
    id: 'venue_rambagh_jaipur',
    title: "The Taj Rambagh Palace",
    city: 'Jaipur',
    subLocation: 'Bhawani Singh Road, Jaipur',
    rating: 5.0,
    reviewsCount: 154,
    price: 750000,
    capacity: "100 to 1000",
    image: 'https://images.unsplash.com/photo-1585983224974-084a8e065e76?auto=format&fit=crop&q=80&w=800',
    tag: 'ROYAL',
    promo: '1 promotion -15%',
    vendorId: 'vendor_rambagh_jaipur',
    vendorName: 'Jaipur Royal Palaces'
  },
  {
    id: 'venue_oberoi_rajvilas',
    title: "The Oberoi Rajvilas",
    city: 'Jaipur',
    subLocation: 'Babaji Ka Nala, Jaipur',
    rating: 4.9,
    reviewsCount: 92,
    price: 600000,
    capacity: "40 to 800",
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    tag: 'TOP',
    promo: 'Royal Welcome package',
    vendorId: 'vendor_oberoi_jaipur',
    vendorName: 'The Oberoi Hotels & Resorts'
  },
  {
    id: 'venue_leela_delhi',
    title: "The Leela Palace New Delhi",
    city: 'Delhi NCR',
    subLocation: 'Chanakyapuri, New Delhi',
    rating: 5.0,
    reviewsCount: 121,
    price: 800000,
    capacity: "80 to 900",
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
    tag: 'ROYAL',
    promo: 'Luxury upgrade -20%',
    vendorId: 'vendor_leela_delhi',
    vendorName: 'The Leela Palaces, Hotels & Resorts'
  },
  {
    id: 'venue_heritage_manesar',
    title: "Heritage Village Resort & Spa",
    city: 'Delhi NCR',
    subLocation: 'Manesar, Gurugram',
    rating: 4.8,
    reviewsCount: 74,
    price: 350000,
    capacity: "200 to 2500",
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    tag: 'PREMIUM',
    promo: '1 promotion -5%',
    vendorId: 'vendor_heritage_manesar',
    vendorName: 'Heritage Hospitality Resorts'
  }
];

export default function Venues() {
  const { user } = useAuth();
  
  // Search parameters
  const [searchName, setSearchName] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  const [activeCityFilter, setActiveCityFilter] = useState('All');
  
  // UI States
  const [showExpertBanner, setShowExpertBanner] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null);

  // Target event dates mapped by venueId -> date string
  const [venueDates, setVenueDates] = useState(() => {
    const saved = localStorage.getItem('gathbandhan_venue_target_dates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const handleSaveVenueDate = (venueId, dateStr) => {
    const updated = { ...venueDates, [venueId]: dateStr };
    setVenueDates(updated);
    localStorage.setItem('gathbandhan_venue_target_dates', JSON.stringify(updated));
    if (dateStr) {
      toast.success(`Target event date updated! Milestone added to Celestial Calendar.`, { id: `date-saved-${venueId}`, duration: 3000 });
    } else {
      toast.success(`Target event date cleared.`, { id: `date-cleared-${venueId}`, duration: 2500 });
    }
  };

  // Firestore sync for user favorites
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

  const toggleFavorite = async (venueId) => {
    if (!user) {
      toast.error('Please sign in to shortlist venues', { id: 'auth-err-fav' });
      return;
    }

    const isFav = favorites.includes(venueId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        favorites: isFav ? arrayRemove(venueId) : arrayUnion(venueId)
      });
      toast.success(isFav ? 'Removed from your cosmic shortlist' : 'Saved to your celestial shortlists!', {
        id: 'fav-toggle-toast',
        icon: isFav ? '🗑️' : '💖'
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to update shortlist');
    }
  };

  const handleRequestPricing = (v) => {
    setSelectedVenueForBooking({
      id: v.id,
      title: v.title,
      price: v.price,
      vendorName: v.vendorName || 'Gathbandhan Venue Concierge',
      vendorId: v.vendorId || 'system_venue_agent'
    });
    setIsBookingOpen(true);
  };

  // Filtered venues logic
  const filteredVenues = PRIMARY_VENUES.filter(venue => {
    const matchesName = venue.title.toLowerCase().includes(searchName.toLowerCase());
    const matchesLocInput = venue.subLocation.toLowerCase().includes(searchLoc.toLowerCase()) || 
                            venue.city.toLowerCase().includes(searchLoc.toLowerCase());
    const matchesCityFilter = activeCityFilter === 'All' || venue.city.toLowerCase() === activeCityFilter.toLowerCase();
    return matchesName && matchesLocInput && matchesCityFilter;
  });

  // Group by city for section renderings
  const citiesToRender = activeCityFilter === 'All' ? ['Hyderabad', 'Bangalore', 'Mumbai', 'Lucknow', 'Jaipur', 'Delhi NCR'] : [activeCityFilter];

  return (
    <div className="pt-28 pb-20 bg-[#fbfbfd] min-h-screen text-gray-800 font-sans">
      
      {/* Breadcrumb section */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-2 text-xs text-gray-400 font-medium">
        <span>Wedding</span>
        <span className="text-gray-300">/</span>
        <span className="text-pink-600 font-bold">Wedding Venues</span>
      </div>

      {/* Main Hero Header and Search Section */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden grid lg:grid-cols-12 min-h-[300px] relative items-center">
          
          {/* Left Text and Search inputs */}
          <div className="lg:col-span-7 p-8 md:p-12 space-y-8 z-10 relative">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight font-serif uppercase">
                Wedding venues
              </h1>
              <p className="text-sm text-gray-400 mt-2 font-medium">
                Find and reserve highly recommended resorts, celestial villas and grand halls
              </p>
            </div>

            {/* Inputs Container */}
            <div className="flex flex-col md:flex-row items-stretch bg-gray-50 p-2.5 rounded-2xl border border-gray-100 gap-2 md:max-w-2xl shadow-inner shadow-gray-100/40">
              
              {/* Venue Search */}
              <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200/60">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Wedding Venues"
                  className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-450 focus:outline-none"
                />
              </div>

              {/* Location Input */}
              <div className="flex-grow flex items-center px-4 py-2">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                  placeholder="Location / Suburb"
                  className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-450 focus:outline-none"
                />
              </div>

              {/* Find Button */}
              <button 
                onClick={() => {
                  toast.success(`Searching complete matching entries!`, { icon: '🔍' });
                }}
                className="bg-[#e22727] hover:bg-[#c11c1c] text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-transform duration-150 active:scale-95 shrink-0"
              >
                Find
              </button>
            </div>
          </div>

          {/* Right curved design picture matching uploaded image layout */}
          <div className="hidden lg:block lg:col-span-5 relative h-full self-stretch select-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800" 
              alt="Luxury table decor"
              className="w-full h-full object-cover origin-center rounded-l-[180px]"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </div>

      {/* Venues by Region Circle Slider Segment */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-black text-gray-900 mb-8 font-serif uppercase tracking-tight">
          Venues by region
        </h2>

        {/* Categories circles scroll bar */}
        <div className="flex items-center space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">
          
          {/* Universal Region Bubble */}
          <div className="flex flex-col items-center shrink-0">
            <button 
              onClick={() => setActiveCityFilter('All')}
              className={cn(
                "w-24 h-24 rounded-full border-2 transition-all flex items-center justify-center font-black text-xs uppercase tracking-wider shadow-sm",
                activeCityFilter === 'All' 
                  ? "border-[#e22727] ring-4 ring-red-50" 
                  : "border-gray-200/80 hover:border-gray-400 bg-white"
              )}
            >
              All Regions
            </button>
            <span className="text-xs font-bold text-gray-700 mt-3">Worldwide</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
              Select
            </span>
          </div>

          {CITIES.map((c) => (
            <div 
              key={c.name}
              className="flex flex-col items-center select-none shrink-0 group cursor-pointer"
              onClick={() => {
                setActiveCityFilter(c.name);
                toast.success(`Filtered for ${c.name} venues!`, { id: `city-f-${c.name}` });
              }}
            >
              <div className="relative">
                <img 
                  src={c.image} 
                  alt={c.name}
                  className={cn(
                    "w-24 h-24 rounded-full object-cover transition-all shadow-sm group-hover:scale-105 border-2",
                    activeCityFilter === c.name 
                      ? "border-[#e22727] ring-4 ring-red-50 scale-105" 
                      : "border-gray-200/80 hover:border-gray-400"
                  )}
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-bold text-gray-700 mt-3">{c.name}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                {c.count} venues
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded/Popup Interactive Helpline Support Banner (Aesthetic matching of standard screenshots) */}
      <AnimatePresence>
        {showExpertBanner && (
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#f0f2f5]/90 border border-gray-250 backdrop-blur-sm rounded-3xl p-6 relative flex flex-col md:flex-row items-center gap-6 shadow-sm overflow-hidden"
            >
              <button 
                onClick={() => setShowExpertBanner(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 duration-150 p-1"
                aria-label="Dismiss custom questions alert"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Avatar Illustrative element */}
              <div className="flex -space-x-2 shrink-0 select-none">
                {/* Traditional avatars or mock user bubble representation */}
                <div className="w-14 h-14 rounded-full bg-pink-100 overflow-hidden ring-4 ring-white flex items-center justify-center">
                  <span className="text-2xl">👰</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-amber-100 overflow-hidden ring-4 ring-white flex items-center justify-center">
                  <span className="text-2xl">🤵</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase italic">
                  Have wedding questions?
                </h3>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1.5 leading-relaxed">
                  Reach out to our wedding experts to plan your Dream Wedding NOW!
                </p>
              </div>

              {/* Communication Links */}
              <div className="flex flex-wrap items-center gap-3">
                <a 
                  href="mailto:experts@gathbandhan.com" 
                  className="w-11 h-11 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
                  title="Email our experts"
                >
                  <MessageSquare className="w-5 h-5" />
                </a>
                <a 
                  href="tel:+918475930701" 
                  className="w-11 h-11 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
                  title="Call Gathbandhan expert"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Speak Directly</span>
                  <a href="tel:+919910502284" className="text-sm font-black text-gray-900 transition-colors hover:text-pink-600">
                    991-050-2284
                  </a>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Venues Grid Sections grouped by city */}
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {citiesToRender.map(cityName => {
          const cityVenues = filteredVenues.filter(v => v.city.toLowerCase() === cityName.toLowerCase());
          if (cityVenues.length === 0) return null;

          return (
            <div key={cityName} className="space-y-6">
              <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 font-serif tracking-tight leading-none uppercase">
                    Venues in {cityName}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                    Premium and verified properties ready for auspicious booking
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveCityFilter(cityName);
                    toast.success(`Viewing all venues from ${cityName}`);
                  }}
                  className="text-xs font-black uppercase text-pink-600 tracking-wider flex items-center hover:text-pink-700 transition-colors gap-1 group hidden sm:flex"
                >
                  Explore more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cityVenues.map((v) => {
                  const isFav = favorites.includes(v.id);
                  return (
                    <motion.div
                      layoutId={v.id}
                      key={v.id}
                      whileHover={{ y: -6 }}
                      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative group duration-300 flex flex-col justify-between"
                    >
                      {/* Image section */}
                      <div className="relative h-48 sm:h-52 overflow-hidden select-none">
                        <img 
                          src={v.image} 
                          alt={v.title}
                          className="w-full h-full object-cover duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Tags over image */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md text-white shadow-sm",
                            v.tag === 'TOP' ? "bg-amber-500" : "bg-purple-600"
                          )}>
                            {v.tag}
                          </span>
                          {v.promo && (
                            <span className="bg-red-500 text-white px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.05em] rounded shadow-sm">
                              {v.promo}
                            </span>
                          )}
                        </div>

                        {/* Heart absolute overlay */}
                        <button
                          onClick={() => toggleFavorite(v.id)}
                          className={cn(
                            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/95 backdrop-blur-sm self-start shadow-md",
                            isFav ? "text-[#e22727]" : "text-gray-400 hover:text-pink-600"
                          )}
                          title="Shortlist Venue"
                        >
                          <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                        </button>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-black text-gray-900 group-hover:text-pink-600 transition-colors uppercase tracking-wide leading-snug line-clamp-2">
                            {v.title}
                          </h4>
                          
                          {/* Rating and Reviews */}
                          <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center text-yellow-500">
                              <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                              {v.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span className="truncate">{v.subLocation}</span>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          {/* Capacity Details */}
                          <div className="flex items-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>Capacity: {v.capacity} Guests</span>
                          </div>

                          {/* Event Date Picker on Venue Card */}
                          <div className="flex flex-col space-y-1 pt-1 border-t border-dashed border-gray-150">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer">
                              <Calendar className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                              Target Wedding Date
                            </label>
                            <div className="relative">
                              <input 
                                type="date"
                                value={venueDates[v.id] || ''}
                                onChange={(e) => handleSaveVenueDate(v.id, e.target.value)}
                                min="2026-01-01"
                                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-gray-700 focus:outline-none focus:bg-white focus:border-pink-500 transition-all cursor-pointer"
                              />
                              {venueDates[v.id] && (
                                <button 
                                  onClick={() => handleSaveVenueDate(v.id, '')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 font-black text-xs px-1"
                                  title="Clear Event Date"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Pricing Details */}
                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <span className="block text-[7px] text-gray-400 uppercase font-black tracking-[0.2em]">Package Price</span>
                              <span className="text-lg font-black text-pink-600 tracking-tight">From {formatCurrency(v.price)}</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA Request Pricing Button */}
                        <button
                          onClick={() => handleRequestPricing(v)}
                          className="w-full h-11 bg-gray-900 hover:bg-pink-600 text-white font-black text-[9px] tracking-widest uppercase rounded-xl transition-all shadow-md group-hover:shadow-pink-100"
                        >
                          Request pricing
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action discover button matching screenshot exactly */}
              <div className="pt-4 text-center">
                <button 
                  onClick={() => {
                    setActiveCityFilter(cityName);
                    toast.success(`Broadened list for entire ${cityName} entries!`);
                  }}
                  className="inline-flex items-center bg-white border border-gray-200 shadow-sm px-6 py-3 rounded-xl text-xs font-black text-gray-700 uppercase tracking-widest hover:border-pink-500 hover:text-pink-600 transition-all duration-300 gap-2"
                >
                  Discover {cityName === 'Hyderabad' ? 452 : cityName === 'Bangalore' ? 784 : 954} venues in {cityName} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State warning */}
      {filteredVenues.length === 0 && (
        <div className="text-center py-20 max-w-lg mx-auto bg-white rounded-3xl border border-dashed border-gray-200 mt-12 p-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-900 uppercase">No Venues Aligned</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-2 leading-relaxed">
            Your custom filters did not matching planetary coordinates. Try resetting your inputs or region fields.
          </p>
        </div>
      )}

      {/* Booking Form Integration */}
      {isBookingOpen && selectedVenueForBooking && (
        <BookingModal 
          service={selectedVenueForBooking}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedVenueForBooking(null);
          }}
          onSuccess={() => {
            toast.success(`Venue query successfully entered! Advisors will update you in 24 hours.`, { duration: 5000 });
          }}
        />
      )}

    </div>
  );
}
