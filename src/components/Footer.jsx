import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Twitter, Facebook, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!email) return toast.error("Please enter your email");
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message: "Newsletter Subscription / Quick Feedback from Footer" }),
      });
      if (response.ok) {
        toast.success("Subscribed & Developer notified!");
        setEmail('');
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      toast.error("Process failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0A0D14] text-white py-24 relative overflow-hidden" style={{ willChange: "transform" }}>
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600 rounded-full blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="Gathbandhan Logo" className="w-12 h-12" />
              <span className="text-2xl font-black uppercase tracking-tighter italic font-serif text-white">Gathbandhan</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium">
              We orchestrate the finest details for your most precious moments, connecting traditions with modern celebrations.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/manish_verma004" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 transition-all duration-300 group">
                <Instagram className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              {[Twitter, Facebook].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 transition-all duration-300 group">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-8">Expertise</h4>
            <ul className="space-y-4">
              {['Our Services', 'AI Planner', 'Inspirations', 'Vendor Hub'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="text-gray-400 text-sm font-bold hover:text-white transition-colors flex items-center group">
                    <span className="w-0 group-hover:w-4 h-[1px] bg-pink-600 transition-all mr-0 group-hover:mr-3" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-8">Office</h4>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Khera Khurd, Aligarh<br />
                  Uttar Pradesh, 202001
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <p className="text-sm text-gray-400 font-bold">+91 84759 30701</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-8">Stay Inspired</h4>
            <p className="text-gray-400 text-sm mb-6 font-medium">Join 5,000+ couples planning with us.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-pink-600 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <button 
                onClick={handleSubscribe}
                disabled={submitting}
                className="absolute right-2 top-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-colors flex items-center disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Join'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; 2026 Gathbandhan Platform. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Digitally Crafted by</span>
            <a href="https://www.instagram.com/manish_verma004" target="_blank" rel="noopener noreferrer" className="text-white text-[10px] font-black uppercase tracking-[0.2em] italic border-b border-pink-600 pb-0.5 hover:text-pink-400 transition-colors">Manish Verma</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
