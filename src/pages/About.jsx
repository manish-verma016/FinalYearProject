import { motion } from 'motion/react';
import { Award, ShieldCheck, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-20 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images Grid */}
          <div className="relative group">
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="h-64 rounded-[2.5rem] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    alt="Wedding"
                  />
                </div>
                <div className="h-96 rounded-[2.5rem] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    alt="Couple"
                  />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4 pt-12"
              >
                <div className="h-96 rounded-[2.5rem] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    alt="Table Setting"
                  />
                </div>
                <div className="h-64 rounded-[2.5rem] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    alt="Bouquet"
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Stats Overlay */}
            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 hidden md:block">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 leading-none">100%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-pink-600 font-black uppercase tracking-[0.3em] text-xs">About Gathbandhan</span>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mt-6 tracking-tight leading-[1.1]">
                Crafting Your <br />
                <span className="italic font-light">Perfect Love Story</span>
              </h1>
              <p className="text-lg text-gray-500 font-light leading-relaxed mt-10 max-w-xl">
                At Gathbandhan, we believe every wedding is a unique masterpiece. Our mission is to simplify the complex world of wedding planning by bringing together the finest vendors, innovative AI tools, and a seamless management system.
              </p>
            </motion.div>

            <div className="space-y-8">
              <div className="flex items-start space-x-6 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Curated Excellence</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    We hand-pick every vendor to ensure your special day meets the highest standards of quality and service.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Transparent</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    From payments to bookings, every transaction is protected and transparent, giving you peace of mind.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 max-w-xl">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-3xl font-black text-gray-900">500+</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Vendors</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900">10k+</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Happy Couples</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
