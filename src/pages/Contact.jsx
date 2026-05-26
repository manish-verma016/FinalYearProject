import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message) return toast.error("Please enter a message");

    setSubmitting(true);
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSent(true);
        toast.success("Feedback sent directly to developer!");
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast.error("Cloud delivery failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)]">
        {/* Contact Form Section */}
        <div className="lg:w-[45%] bg-[#0A0D14] p-8 lg:p-20 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600 rounded-full blur-[120px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <span className="text-pink-500 font-black uppercase tracking-[0.4em] text-[10px]">Get in touch</span>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mt-4 mb-12 tracking-tight">
              Let's Plan Your <br />
              <span className="italic font-light">Big Day</span>
            </h1>

            {sent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#161B26] p-12 rounded-[2rem] text-center"
              >
                <div className="w-20 h-20 bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Received!</h3>
                <p className="text-gray-400 text-sm">Your feedback has been emailed to our team.</p>
                <button 
                  onClick={() => setSent(false)}
                  className="mt-8 text-pink-500 text-[10px] font-black uppercase tracking-widest hover:text-pink-400"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#161B26] border-none rounded-2xl px-6 py-5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                  />
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#161B26] border-none rounded-2xl px-6 py-5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                  />
                </div>

                <textarea 
                  rows={6}
                  placeholder="Tell us about your wedding plans..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-[#161B26] border-none rounded-3xl px-6 py-6 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all resize-none"
                />

                <button 
                  disabled={submitting}
                  className="bg-pink-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-pink-500 transition-all shadow-xl shadow-pink-900/20 active:scale-95 flex items-center space-x-3 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
            )}

            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#161B26] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Call Us</p>
                  <p className="text-sm font-bold text-white">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#161B26] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Email Us</p>
                  <p className="text-sm font-bold text-white">hello@gathbandhan.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <div className="lg:w-[55%] h-[500px] lg:h-auto overflow-hidden relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3527.2436402434!2d78.0700!3d27.8914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDUzJzI5LjAiTiA3OMKwMDQnMTIuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
            className="w-full h-full border-none filter grayscale contrast-125"
            loading="lazy"
          ></iframe>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] to-transparent lg:w-32" />
        </div>
      </div>
    </div>
  );
}
