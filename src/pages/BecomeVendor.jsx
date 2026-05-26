import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Store, User, Phone, MapPin, Briefcase, IndianRupee, Loader2, Sparkles, Wand2, ShieldCheck, Instagram, Globe, History } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../constants';

export default function BecomeVendor() {
  const { user, role, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Pandit',
    price: '',
    location: '',
    experience: '',
    description: '',
    features: '',
    imageUrl: '',
    // New fields
    businessId: '', // Aadhar or GST
    altPhone: '',
    fullAddress: '',
    instagram: '',
    portfolio: '',
    yearsInBusiness: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to register');
      return;
    }

    setLoading(true);
    try {
      // 1. Add the service
      await addDoc(collection(db, 'services'), {
        vendorId: user.uid,
        vendorName: user.displayName,
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        location: formData.location,
        experience: Number(formData.experience) || Number(formData.yearsInBusiness),
        description: formData.description,
        features: formData.features.split(',').map(f => f.trim()),
        status: 'pending',
        rating: 4.5,
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800'],
        createdAt: serverTimestamp(),
        // Extra meta
        businessId: formData.businessId,
        altPhone: formData.altPhone,
        fullAddress: formData.fullAddress,
        socials: {
          instagram: formData.instagram,
          portfolio: formData.portfolio
        }
      });

      // 2. Update user role if not already vendor/admin
      if (role !== 'admin' && role !== 'vendor') {
        await updateDoc(doc(db, 'users', user.uid), { 
          role: 'vendor',
          businessInfo: {
            isVerified: false,
            joinedAt: serverTimestamp()
          }
        });
        await refreshRole();
      }

      toast.success('Registration successful! Our admin team will review your application for verification shortly.', {
        duration: 5000,
        icon: '🙏'
      });
      navigate('/vendor');
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="pt-32 pb-20 max-w-6xl mx-auto px-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-16"
      >
        <motion.div
           variants={itemVariants}
           className="inline-flex items-center justify-center p-5 bg-pink-50 rounded-[2rem] mb-8 shadow-inner shadow-pink-100/50"
        >
          <Store className="w-10 h-10 text-pink-600" />
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic leading-none">
          Elevate Your Business
        </motion.h1>
        <motion.p variants={itemVariants} className="text-gray-400 font-medium max-w-xl mx-auto uppercase text-[10px] tracking-[0.3em]">
          Join India's most innovative wedding vendor ecosystem
        </motion.p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Progress Sidebar */}
        <div className="lg:col-span-3">
          <div className="sticky top-32 space-y-4">
            {[
              { id: 1, name: 'Core Identity', icon: User },
              { id: 2, name: 'Service Specs', icon: Briefcase },
              { id: 3, name: 'Verification', icon: ShieldCheck },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={cn(
                  "w-full flex items-center p-6 rounded-[1.5rem] transition-all border",
                  step === s.id 
                    ? "bg-gray-900 border-gray-900 text-white shadow-xl translate-x-2" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-pink-200"
                )}
              >
                <s.icon className={cn("w-5 h-5 mr-4", step === s.id ? "text-pink-400" : "text-gray-200")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSubmit} className="bg-white p-12 lg:p-16 rounded-[3.5rem] border border-gray-50 shadow-2xl space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-40 pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="border-l-4 border-pink-600 pl-8">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Basic Information</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">How people will find your business</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Professional Title</label>
                      <div className="relative">
                          <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                          <input
                            required
                            type="text"
                            placeholder="e.g. Royal Vedic Pandit Group"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Category</label>
                      <div className="relative">
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold appearance-none shadow-inner"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Wand2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Official Address</label>
                      <div className="relative">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                          <input
                            required
                            type="text"
                            placeholder="Plot No, Street, Landmark, City"
                            value={formData.fullAddress}
                            onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setStep(2)} className="bg-gray-900 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-pink-600 transition-all shadow-xl shadow-gray-100">Next Suite</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="border-l-4 border-pink-600 pl-8">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Service Configuration</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Define your pricing and offering</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Starting Price (₹)</label>
                      <div className="relative">
                          <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                          <input
                            required
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Years in Industry</label>
                      <div className="relative">
                          <History className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                          <input
                            required
                            type="number"
                            placeholder="e.g. 10"
                            value={formData.yearsInBusiness}
                            onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Signature Features (Comma Separated)</label>
                       <textarea
                         required
                         rows={2}
                         placeholder="Traditional Decor, Live Music, Drone Photography, Multi-cuisine..."
                         value={formData.features}
                         onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                         className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                       />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Service Description</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Craft an enticing description of your service excellence..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setStep(1)} className="px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all">Back</button>
                    <button type="button" onClick={() => setStep(3)} className="bg-gray-900 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-pink-600 transition-all shadow-xl shadow-gray-100">Almost Done</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="border-l-4 border-pink-600 pl-8">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Verification & Socials</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Build trust with your future clients</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">GST/Aadhaar Number (Private)</label>
                      <div className="relative">
                          <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            required
                            type="text"
                            placeholder="Verification ID"
                            value={formData.businessId}
                            onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Secondary Contact</label>
                      <div className="relative">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                          <input
                            type="tel"
                            placeholder="+91 - Alternate"
                            value={formData.altPhone}
                            onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Instagram Portfolio</label>
                      <div className="relative">
                          <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                          <input
                            type="text"
                            placeholder="@username"
                            value={formData.instagram}
                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Portfolio Link</label>
                      <div className="relative">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                          <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={formData.portfolio}
                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                          />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Profile Showcase Image (URL)</label>
                      <input
                        type="url"
                        placeholder="Paste a direct image link for your banner"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-pink-600 outline-none transition-all text-sm font-bold shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-6 pt-10">
                     <button type="button" onClick={() => setStep(2)} className="px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all">Back</button>
                     <button
                        type="submit"
                        disabled={loading}
                        className="flex-grow bg-gray-900 text-white h-20 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-pink-600 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95 shadow-2xl shadow-gray-100"
                      >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                          <>Finish Professional Registration <Sparkles className="w-5 h-5 ml-4" /></>
                        )}
                      </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
