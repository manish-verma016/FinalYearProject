import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sparkles, Heart, Calendar, MapPin, Clock, Loader2, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { INVITATION_TEMPLATES } from '../constants';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function GuestInvitation() {
  const { id } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);

  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [updatingRsvp, setUpdatingRsvp] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const docRef = doc(db, 'invitations', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setInvitation(data);
          const tmpl = INVITATION_TEMPLATES.find(t => t.id === data.templateId) || INVITATION_TEMPLATES[0];
          setTemplate(tmpl);
          
          // Check if this guest already RSVP'd (this is simplified as we don't have per-guest unique RSVP collection yet, but we'll store it as an field or subcollection later)
        }
      } catch (error) {
        console.error("Error loading invitation:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [id]);

  const handleRSVP = async (status) => {
    setUpdatingRsvp(true);
    try {
      // In a real app, we'd update a specific guest document or a subcollection
      // For now, we'll just track it in the local state to simulate the experience
      setRsvpStatus(status);
      toast.success(`Thank you! RSVP marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update RSVP');
    } finally {
      setUpdatingRsvp(false);
    }
  };

  const addToCalendar = () => {
    const text = `Wedding of ${cardData.groom} & ${cardData.bride}`;
    const date = cardData.date.replace(/[^0-9]/g, ''); // Simplified
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&location=${encodeURIComponent(cardData.venue)}&details=${encodeURIComponent(cardData.message)}`;
    window.open(url, '_blank');
  };

  const openMap = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cardData.venue)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <X className="w-16 h-16 text-gray-200 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Invitation Not Found</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 mb-8">The link might be expired or incorrect.</p>
        <Link to="/" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Back to Vows & Visions</Link>
      </div>
    );
  }

  const { cardData } = invitation;
  const queryParams = new URLSearchParams(window.location.search);
  const guestName = queryParams.get('g');

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-8 relative overflow-hidden" style={{ backgroundColor: template.color }}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden grayscale contrast-125 mix-blend-multiply">
        <img src={template.image} className="w-full h-full object-cover scale-110 blur-sm" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className={cn(
          "max-w-xl w-full min-h-screen md:min-h-0 md:aspect-[3/4.2] flex flex-col justify-between relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-10 md:rounded-[4rem] overflow-hidden group border-[12px]",
          template.style
        )}
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        {/* Layered Content */}
        <div className="flex-grow flex flex-col items-center justify-center text-center px-10 md:px-16 py-20 space-y-12 bg-black/5 backdrop-blur-[2px]">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-pink-500 blur-2xl opacity-20 scale-150 rounded-full" />
            <Heart className="w-16 h-16 text-pink-500 mx-auto fill-pink-500/20 relative z-10" />
          </motion.div>
          
          <div className="space-y-6">
            <p className={cn(
              "text-[10px] uppercase font-black tracking-[0.6em] mb-4 opacity-50",
              template.textColor.includes('#F') ? 'text-white' : 'text-gray-900'
            )}>
              Together with their families
            </p>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.8] mb-2 flex flex-col items-center",
                template.font,
                template.textColor.includes('#F') ? 'text-white' : 'text-gray-900'
              )}
            >
              <span className="block">{cardData.groom}</span>
              <span className="text-3xl not-italic opacity-20 my-6 font-light">&</span>
              <span className="block">{cardData.bride}</span>
            </motion.h2>

            <div className="h-px w-12 bg-pink-500/30 mx-auto my-8" />

            <p className={cn(
              "text-[13px] font-bold max-w-[280px] mx-auto leading-relaxed opacity-70 italic font-serif",
              template.textColor.includes('#F') ? 'text-white' : 'text-gray-900'
            )}>
              "{cardData.message}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-[340px]">
            <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={addToCalendar}
               className="flex items-center justify-between px-8 bg-white/10 backdrop-blur-md py-5 rounded-3xl border border-white/10 group"
            >
               <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-pink-500 group-hover:rotate-12 transition-transform" />
                  <p className={cn("text-xs font-black tracking-widest uppercase", template.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>{cardData.date}</p>
               </div>
               <ChevronRight className="w-4 h-4 opacity-20" />
            </motion.button>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/5 space-y-2"
              >
                <Clock className="w-5 h-5 text-pink-400" />
                <p className={cn("text-[10px] font-black tracking-widest uppercase", template.textColor.includes('#F') ? 'text-white' : 'text-gray-900/60')}>{cardData.time}</p>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                onClick={openMap}
                className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/5 space-y-2 group"
              >
                <MapPin className="w-5 h-5 text-pink-400 group-hover:bounce transition-all" />
                <p className={cn("text-[9px] font-black tracking-widest uppercase truncate max-w-[100px]", template.textColor.includes('#F') ? 'text-white' : 'text-gray-900/60')}>Location</p>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Fancy RSVP Bar */}
        <div className="bg-white/10 backdrop-blur-2xl py-10 px-12 flex flex-col md:flex-row items-center justify-between border-t border-white/10 gap-6">
            <div className="text-center md:text-left">
              <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-50", template.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>Reserved For</p>
              <h4 className={cn("text-2xl font-black uppercase tracking-tighter italic lg:text-3xl", template.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>
                {guestName ? decodeURIComponent(guestName) : 'Distinguished Guest'}
              </h4>
            </div>
            
            <div className="flex items-center space-x-2">
               {rsvpStatus ? (
                 <div className="bg-pink-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center">
                   <CheckCircle2 className="w-4 h-4 mr-3" />
                   Status: {rsvpStatus}
                 </div>
               ) : (
                 <>
                   <button 
                     onClick={() => handleRSVP('Attending')}
                     disabled={updatingRsvp}
                     className="bg-pink-600 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                   >
                     Will Attend
                   </button>
                   <button 
                     onClick={() => handleRSVP('Declined')}
                     disabled={updatingRsvp}
                     className="bg-white/10 text-white px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50 underline decoration-pink-500 underline-offset-4"
                   >
                     Decline
                   </button>
                 </>
               )}
            </div>
        </div>
      </motion.div>

      {/* Aesthetic Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
    </div>
  );
}
