import { motion } from 'motion/react';
import { Search, Heart, Sparkles, MapPin, ArrowRight, MessageSquare, Send, Loader2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const categories = [
  { id: 'pandit', name: 'Pandit', icon: '🕉️', color: 'bg-orange-100' },
  { id: 'dj', name: 'DJ & Sound', icon: '🎧', color: 'bg-blue-100' },
  { id: 'decoration', name: 'Decoration', icon: '🌸', color: 'bg-pink-100' },
  { id: 'catering', name: 'Catering', icon: '🍱', color: 'bg-green-100' },
  { id: 'photography', name: 'Photography', icon: '📸', color: 'bg-purple-100' },
  { id: 'astrology', name: 'Astrology', icon: '✨', color: 'bg-yellow-100' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const message = formData.get('message');
    
    setSubmittingFeedback(true);
    const toastId = toast.loading('Sending feedback directly...');
    
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message: `Home Page Suggestion: ${message}` }),
      });

      if (response.ok) {
        toast.success('Thank you! Your feedback has been sent directly to Manish.', {
          id: toastId,
        });
        e.target.reset();
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      toast.error('Cloud delivery failed. Please try again.', { id: toastId });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('loc', location);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="pt-32">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2669"
            alt="Wedding Background"
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-5 py-1.5 rounded-full bg-pink-100/90 text-pink-600 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-6 shadow-sm border border-pink-200/50">
              YOUR DREAM WEDDING STARTS HERE
            </span>
            <h1 className="text-5xl md:text-[6.5rem] font-extrabold mb-4 tracking-tight leading-[1]">
              Plan Your Perfect <br />
              <span className="text-[#ec4899] font-cursive normal-case font-normal text-6xl md:text-[6.5rem] mt-2 block tracking-wide">
                gathbandhan
              </span>
            </h1>
            <p className="text-sm md:text-base text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
              Connecting you with the finest wedding vendors, astrologers, and planners to make your special day truly unforgettable.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-full p-2 shadow-xl flex items-center border border-gray-100">
              <div className="flex-1 flex items-center px-4 md:px-6">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search for Pandits, DJs, Venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full py-3 bg-transparent text-gray-900 placeholder-gray-450 focus:outline-none text-xs md:text-sm font-medium"
                />
              </div>
              <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />
              <div className="hidden md:flex items-center px-6">
                <div className="w-10 h-10 bg-white border border-gray-150 rounded-full flex items-center justify-center mr-3 shadow-sm shrink-0">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-28 py-3 bg-transparent text-gray-900 placeholder-gray-450 focus:outline-none text-xs md:text-sm font-medium"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-[#0f172a] hover:bg-[#ec4899] w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md group shrink-0 ml-auto"
              >
                <Search className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-24 bg-white relative">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-xs font-bold text-pink-600 uppercase tracking-[0.3em] mb-4">Our Premium Offerings</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 font-serif leading-tight">Wedding Services</h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="group flex flex-col items-center"
              >
                <Link to={`/services?category=${category.name === 'DJ & Sound' ? 'DJ' : category.name}`} className="block cursor-pointer w-full">
                  <motion.div 
                    whileHover={{ 
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-16 h-16 mx-auto rounded-2xl mb-4 flex items-center justify-center text-xl shadow-md transition-all duration-500 group-hover:shadow-pink-100 group-hover:ring-4 group-hover:ring-pink-50/50 relative overflow-hidden", 
                      category.color
                    )}
                  >
                    <motion.span
                      animate={{ 
                        y: [0, -3, 0],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: idx * 0.2
                      }}
                      whileHover={{ rotate: [0, 15, -15, 0], scale: 1.2 }}
                    >
                      {category.icon}
                    </motion.span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                  </motion.div>
                  <h4 className="text-center text-xs font-black text-gray-400 uppercase tracking-widest transition-all group-hover:text-pink-600 group-hover:tracking-[0.2em]">{category.name}</h4>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Wedding Planner Teaser */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                AI Wedding <br /> Planner
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed font-light">
                Not sure where to start? Let our AI assistant help you design your perfect wedding itinerary and suggest unique themes based on your style.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/ai-planner"
                  className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold hover:bg-pink-700 transition-all flex items-center shadow-xl shadow-pink-100 group"
                >
                  Get AI Itinerary <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/inspiration"
                  className="bg-white text-gray-900 border border-gray-100 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                  Explore Themes
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-2xl relative"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-700 text-sm">
                  "Traditional Vedic ceremonies are enhanced by natural elements like wood, clay, and abundant fresh jasmine..."
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-700 text-sm">
                  "For a Royal Heritage theme, consider a palette of Emerald Green and Burnished Gold with marigold accents..."
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Suggestion</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Astro & Spiritual Tools */}
      <section className="py-24 bg-gray-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-slow-reverse" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-pink-500 font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Celestial Guidance</span>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none mb-6">
              Vedic Astrology <br />
              <span className="text-pink-600 font-serif lowercase font-light not-italic tracking-normal">& match making</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto font-medium text-sm leading-relaxed mb-12">
              Ensure your union is blessed by the stars. Our specialized tools analyze Gunas and celestial positions for the perfect beginning.
            </p>
            <div className="flex justify-center gap-6">
               <Link 
                to="/astro-tools" 
                className="group relative bg-white text-gray-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-pink-600 hover:text-white transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Try Kundali Matcher <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>
              <Link 
                to="/astro-tools" 
                className="group relative border border-white/20 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:border-pink-600 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Muhurut Finder <Sparkles className="w-4 h-4 ml-3 text-pink-500" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact & Location Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <span className="text-pink-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Direct Contact</span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[0.9]">
                  Get in Touch <br />
                  <span className="italic font-light lowercase text-pink-600">with us</span>
                </h2>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-gray-200 p-2">
                    <img src="/logo.svg" alt="Gathbandhan Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Founder & CEO</p>
                    <p className="text-2xl font-black text-gray-900 uppercase tracking-tight">Manish Verma</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-pink-200 transition-colors group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5 text-gray-400 rotate-90" />
                    </div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-lg font-black text-gray-900 tracking-tight">+91 84759 30701</p>
                  </div>

                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-pink-200 transition-colors group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Office</p>
                    <p className="text-lg font-black text-gray-900 tracking-tight uppercase">Aligarh, UP</p>
                  </div>
                </div>

                <div className="p-8 bg-gray-900 rounded-[2rem] text-white">
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2">Address</p>
                  <p className="text-sm font-medium leading-relaxed italic opacity-80">
                    Khera Khurd, Aligarh, <br />
                    Uttar Pradesh, India - 202001
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-gray-200"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112871.4913210168!2d77.99446417755355!3d27.89139886326168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397405be351508ef%3A0xe54e604f8e6b360b!2sAligarh%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-none filter grayscale hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                referrerPolicy="no-referrer"
              ></iframe>
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20">
                <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-1">Our Location</p>
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Khera Khurd, Aligarh</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feedback & Suggestion Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-[4rem] p-12 lg:p-20 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className="w-20 h-20 bg-pink-50 rounded-[2rem] flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-pink-600" />
              </div>
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-tight uppercase italic">
                  Feedbacks & <br />
                  <span className="text-pink-600">Suggestions</span>
                </h2>
                <p className="text-gray-500 font-medium text-lg mt-6 leading-relaxed">
                  Your thoughts help us cultivate better experiences. Have an idea or some feedback? We're all ears.
                </p>
              </div>
              <div className="pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Direct Channel</p>
                <p className="text-xl font-bold text-gray-900">manish847593@gmail.com</p>
              </div>
            </div>

            <div className="lg:w-1/2 w-full bg-gray-900 rounded-3xl p-10 lg:p-12 text-white shadow-2xl">
              <form 
                onSubmit={handleFeedbackSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-3 block">Your Name</label>
                  <input 
                    name="name"
                    required
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-600 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-3 block">Your Suggestion</label>
                  <textarea 
                    name="message"
                    required
                    rows={4}
                    placeholder="What's on your mind?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-pink-600 transition-all text-sm resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-3" />
                      Digital Send...
                    </>
                  ) : (
                    <>
                      Send to Manish <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
