import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Palette, 
  Type, 
  Users, 
  Mail, 
  Phone, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Search,
  CheckCircle2,
  X,
  Share2,
  Loader2,
  BrainCircuit,
  History,
  Calendar,
  Clock,
  MapPin,
  Eye,
  Trash2,
  Square,
  CheckSquare
} from 'lucide-react';
import { INVITATION_TEMPLATES } from '../constants';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { generateInvitationContent } from '../lib/geminiService';
import HistoryTab from '../components/invitations/HistoryTab';

export default function Invitations() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(INVITATION_TEMPLATES[0]);
  const [step, setStep] = useState(1); // 1: Browse, 2: Customize, 3: Send, 4: History
  const [guests, setGuests] = useState([]);
  const [invitationsHistory, setInvitationsHistory] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [expandedHistory, setExpandedHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiOptions, setAiOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedHistoryItems, setSelectedHistoryItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const processInvitations = (docs) => {
    return docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a,b) => {
        const timeA = a.sentAt?.toMillis ? a.sentAt.toMillis() : 0;
        const timeB = b.sentAt?.toMillis ? b.sentAt.toMillis() : 0;
        return timeB - timeA;
      });
  };

  const handleSelectAllHistory = () => {
    if (selectedHistoryItems.length === invitationsHistory.length) {
      setSelectedHistoryItems([]);
    } else {
      setSelectedHistoryItems(invitationsHistory.map(inv => inv.id));
    }
  };

  const handleClearAllHistory = async () => {
    if (invitationsHistory.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ALL ${invitationsHistory.length} invitation batches from history?`)) return;
    
    handleDeleteHistory(invitationsHistory.map(inv => inv.id));
  };

  const handleDeleteHistory = async (ids, isBatch = true) => {
    if (!ids || ids.length === 0) return;
    
    const message = isBatch 
      ? `Are you sure you want to delete ${ids.length} invitation(s) from history?`
      : 'Are you sure you want to delete this invitation from history?';
      
    if (!window.confirm(message)) return;
    
    setIsDeleting(true);
    const toastId = toast.loading(isBatch ? `Deleting ${ids.length} items...` : 'Deleting invitation...');
    
    // Store previous state for rollback
    const previousHistory = [...invitationsHistory];
    
    try {
      // Optimistic update
      setInvitationsHistory(prev => prev.filter(inv => !ids.includes(inv.id)));
      setSelectedHistoryItems(prev => prev.filter(id => !ids.includes(id)));
      setExpandedHistory(prev => prev.filter(id => !ids.includes(id)));

      if (ids.length === 1) {
        await deleteDoc(doc(db, 'invitations', ids[0]));
      } else {
        const batch = writeBatch(db);
        ids.forEach(id => {
          batch.delete(doc(db, 'invitations', id));
        });
        await batch.commit();
      }
      
      toast.success('Deleted successfully', { id: toastId });
    } catch (error) {
      console.error('Delete error:', error);
      // Rollback on error
      setInvitationsHistory(previousHistory);
      toast.error('Failed to delete. Access denied or connection issue.', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleHistorySelection = (id) => {
    setSelectedHistoryItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || g.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const guestCategories = ['All', ...new Set(guests.map(g => g.category))];

  const [cardData, setCardData] = useState({
    groom: 'Groom Name',
    bride: 'Bride Name',
    date: '12th May 2026',
    venue: 'Royal Orchid Gardens, Jaipur',
    time: '07:00 PM onwards',
    message: 'Together with our families, we invite you to celebrate our union.'
  });

  useEffect(() => {
    if (user) {
      const fetchGuests = async () => {
        setLoading(true);
        try {
          const q = query(collection(db, 'guests'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          setGuests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error('Error fetching guests:', error);
        } finally {
          setLoading(false);
        }
      };

      const fetchHistory = async () => {
        try {
          const q = query(collection(db, 'invitations'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          setInvitationsHistory(processInvitations(snap.docs));
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      };

      fetchGuests();
      fetchHistory();
    }
  }, [user]);

  const toggleHistory = (id) => {
    setExpandedHistory(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleManualDelivery = async (invitationId, guestId, guestEmail) => {
    try {
      const invRef = doc(db, 'invitations', invitationId);
      
      const invitation = invitationsHistory.find(i => i.id === invitationId);
      if (!invitation) return;

      const currentResults = invitation.deliveryResults || [];
      const existingIdx = currentResults.findIndex(r => r.guestId === guestId || (guestEmail && r.email === guestEmail));

      let updatedResults;
      if (existingIdx >= 0) {
        updatedResults = [...currentResults];
        updatedResults[existingIdx] = {
          ...updatedResults[existingIdx],
          status: 'sent',
          method: 'whatsapp',
          sentAt: new Date().toISOString()
        };
      } else {
        updatedResults = [...currentResults, {
          guestId,
          email: guestEmail || null,
          status: 'sent',
          method: 'whatsapp',
          sentAt: new Date().toISOString()
        }];
      }

      await updateDoc(invRef, {
        deliveryResults: updatedResults
      });

      setInvitationsHistory(prev => prev.map(inv => 
        inv.id === invitationId ? { ...inv, deliveryResults: updatedResults } : inv
      ));

      toast.success('Marked as delivered via WhatsApp!', { icon: '✅' });
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const toggleGuest = (id) => {
    setSelectedGuests(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (selectedGuests.length === 0) {
      toast.error('Please select at least one guest');
      return;
    }

    setSending(true);
    const toastId = toast.loading('Initiating celestial broadcast...');
    
    try {
      // Check online status
      if (!window.navigator.onLine) {
        throw new Error('You are currently offline. Please reconnect to broadcast invitations.');
      }

      const selectedGuestDetails = guests.filter(g => selectedGuests.includes(g.id));
      
      // 1. Save to Invitations collection FIRST to get the unique ID
      const savePromise = addDoc(collection(db, 'invitations'), {
        userId: user.uid,
        templateId: selectedTemplate.id,
        cardData,
        guestIds: selectedGuests,
        sentAt: serverTimestamp(),
        status: 'sent',
        deliveryResults: selectedGuestDetails.map(g => ({
          guestId: g.id,
          email: g.email || null,
          status: 'queued',
          method: 'email'
        }))
      });

      const inviteRef = await Promise.race([
        savePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore connection timed out. The backend might be unreachable.')), 10000))
      ]);

      const inviteId = inviteRef.id;
      const inviteLink = `${window.location.origin}/invite/${inviteId}`;

      // 2. Call Backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for the whole batch

      let response;
      try {
        response = await fetch('/api/send-invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            guests: selectedGuestDetails,
            cardData,
            templateId: selectedTemplate.id,
            inviteLink,
            inviteId
          }),
        });
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          throw new Error('The dispatch timed out. Some invitations might have been sent, please check history.');
        }
        throw e;
      } finally {
        clearTimeout(timeoutId);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error('Server returned an invalid response. API might be down.');
      }

      if (!response.ok || !result.results) {
        // Update batch status to failed in Firestore
        await updateDoc(inviteRef, { status: 'failed' });
        
        if (result.setupNeeded) {
          throw new Error('Resend API key is missing. Please contact administrator.');
        }
        throw new Error(result.error || 'Broadcast failed at the celestial gate.');
      }

      // 3. Update the invitation record with final delivery results
      const finalResults = result.results.map(r => ({
        guestId: selectedGuestDetails.find(g => g.email === r.email)?.id || null,
        email: r.email,
        status: r.status, // 'sent' or 'failed'
        error: r.error || null,
        isDomainLimit: !!r.isDomainLimit,
        method: 'email',
        sentAt: new Date().toISOString()
      }));

      await updateDoc(inviteRef, {
        deliveryResults: finalResults,
        status: 'completed'
      });

      // Update history
      const q = query(collection(db, 'invitations'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setInvitationsHistory(processInvitations(snap.docs));
      
      const failedEmails = result.results?.filter(r => r.status === 'failed') || [];
      const domainRestrictedCount = result.results?.filter(r => r.isDomainLimit || r.error?.includes('DOMAIN_LIMITATION')).length || 0;
      const successCount = (result.results?.length || 0) - failedEmails.length;

      toast.dismiss(toastId);
      
      toast.custom((t) => (
        <div className={cn(
          "bg-white p-6 rounded-[2.5rem] shadow-2xl border border-pink-100 flex flex-col space-y-4 min-w-[340px] max-w-[420px] relative overflow-hidden",
          t.visible ? "animate-enter" : "animate-leave"
        )}>
           <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
           
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", domainRestrictedCount > 0 ? "bg-orange-50" : "bg-pink-50")}>
                   <Send className={cn("w-6 h-6", domainRestrictedCount > 0 ? "text-orange-600" : "text-pink-600")} />
                </div>
                <div>
                   <p className="text-sm font-black text-gray-900 uppercase tracking-tighter italic">Broadcast Status</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                     {successCount} Sent • {domainRestrictedCount} Local Share Required
                   </p>
                </div>
              </div>
              <button onClick={() => toast.dismiss(t.id)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
           </div>
           
           <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ready for WhatsApp</p>
                <div className="flex items-center space-x-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[9px] text-green-600 font-black uppercase tracking-tighter">Live Links</span>
                </div>
              </div>
              
              <div className="max-h-[240px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {selectedGuestDetails.map((guest) => {
                  const personalizedLink = `${inviteLink}?g=${encodeURIComponent(guest.name)}`;
                  const waText = encodeURIComponent(`🕉️ *WEDDING INVITATION* 🕉️\n\nDearest *${guest.name}*,\n\nYou're cordially invited to celebrate the union of *${cardData.groom}* & *${cardData.bride}*.\n\n✨ View My Personalized Invite ✨\n${personalizedLink}\n\nCan't wait to see you there!`);
                  const delivery = result.results?.find(r => r.email === guest.email);
                  const isSent = delivery?.status === 'sent';

                  return (
                    <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-pink-100 transition-all group">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                           <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{guest.name}</span>
                           {isSent && <span className="text-[8px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Emailed</span>}
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold tracking-widest">{guest.phone || 'No WhatsApp'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Link to={`/invite/${inviteId}?g=${encodeURIComponent(guest.name)}`} target="_blank" className="p-2 text-gray-400 hover:text-pink-600 transition-colors">
                          <Palette className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => {
                            if (!guest.phone) return toast.error("Phone number missing!");
                            window.open(`https://wa.me/${guest.phone.replace(/\D/g,'')}?text=${waText}`, '_blank');
                            handleManualDelivery(inviteId, guest.id, guest.email);
                          }}
                          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm hover:bg-green-600 hover:text-white transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>

           {domainRestrictedCount > 0 && (
             <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-[9px] text-orange-600 font-bold leading-relaxed">
                  <Mail className="w-3 h-3 inline mr-1 mb-0.5" /> 
                  Some emails skipped (Free Tier). Click the WhatsApp buttons above to share manually!
                </p>
             </div>
           )}
        </div>
      ), { duration: 30000 });

      setStep(4); // Move to history
      // Reset selection
      setSelectedGuests([]);
    } catch (error) {
      console.error('Broadcast Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate broadcast', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-40 pb-20 text-center">
        <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Auth Required</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Please sign in to access the invitation suite.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
        <div className="relative">
           <div className="flex items-center space-x-3 mb-6">
              <span className="px-4 py-1.5 bg-pink-50 text-pink-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-pink-100">Pro Studio</span>
              <div className="h-4 w-[1px] bg-gray-200" />
              <div className="flex items-center space-x-2">
                 {[1,2,3,4].map(i => (
                   <motion.div 
                    key={i} 
                    initial={false}
                    animate={{ 
                      width: step === i ? 24 : 6,
                      backgroundColor: step >= i ? "#db2777" : "#e5e7eb"
                    }}
                    className="h-1.5 rounded-full" 
                   />
                 ))}
              </div>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-[0.8] mb-8 italic uppercase">
             Digital<br /><span className="text-pink-600">Invites</span>
           </h1>
           <p className="max-w-md text-gray-400 font-medium text-[12px] leading-relaxed">
             Crafting celestial connections through bespoke digital design. Elevate your union with our signature invitation suite.
           </p>
        </div>

        <div className="flex flex-wrap bg-gray-50/50 backdrop-blur-xl p-2 rounded-[2.5rem] border border-gray-100 shadow-sm self-start lg:self-end">
           {[
             { id: 1, label: 'Template', icon: Palette },
             { id: 2, label: 'Design', icon: Type },
             { id: 3, label: 'Dispatch', icon: Send },
             { id: 4, label: 'History', icon: History }
           ].map((item) => (
             <button 
               key={item.id}
               onClick={() => setStep(item.id)}
               className={cn(
                 "flex items-center space-x-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500", 
                 step === item.id 
                   ? "bg-white text-gray-900 shadow-xl shadow-gray-200/50 scale-[1.05] z-10" 
                   : "text-gray-400 hover:text-gray-600"
               )}
             >
               <item.icon className={cn("w-3.5 h-3.5", step === item.id ? "text-pink-600" : "text-gray-300")} />
               <span>{item.label}</span>
             </button>
           ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
          >
            {INVITATION_TEMPLATES.map((tmpl, idx) => (
              <motion.div
                key={tmpl.id || `tmpl-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => { setSelectedTemplate(tmpl); setStep(2); }}
                className={cn(
                  "group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500",
                  selectedTemplate.id === tmpl.id ? "ring-4 ring-pink-600/20 shadow-lg scale-[1.02]" : "hover:shadow-lg"
                )}
              >
                <div className="absolute inset-0 bg-gray-200">
                  <img 
                    src={tmpl.image} 
                    draggable={false}
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                    alt={tmpl.name} 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                </div>
                
                <div className="absolute inset-x-2 bottom-2 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                   <div className="flex items-center justify-between">
                     <p className="text-[6px] font-black text-white uppercase tracking-[0.3em] opacity-80">{tmpl.category}</p>
                   </div>
                   <h3 className="text-[10px] font-black text-white italic tracking-tighter uppercase leading-none mb-1">{tmpl.name}</h3>
                </div>

                {selectedTemplate.id === tmpl.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="customize"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="flex flex-col lg:flex-row gap-20 items-start min-h-[800px]"
          >
            {/* Live Preview - Left Sticky */}
            <div className="lg:w-[45%] sticky top-36">
               <div className="relative group">
                  {/* Decorative Floating Accents */}
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-pink-100/50 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-50 rounded-full blur-3xl" />
                  
                  <div className={cn(
                    "aspect-[3/4.2] rounded-[4.5rem] p-16 flex flex-col justify-between relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] z-10 border-[16px] transition-all duration-700 overflow-hidden",
                    selectedTemplate.style
                  )} style={{ backgroundColor: selectedTemplate.color, borderColor: 'rgba(255,255,255,0.1)' }}>
                    
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <img src={selectedTemplate.image} className="w-full h-full object-cover scale-110" />
                    </div>
                    
                    <div className="relative text-center space-y-12">
                       <motion.div
                         animate={{ rotate: [0, 10, -10, 0] }}
                         transition={{ repeat: Infinity, duration: 6 }}
                       >
                         <Sparkles className="w-12 h-12 text-pink-500 mx-auto opacity-30" />
                       </motion.div>
                       
                       <div className="space-y-6">
                          <p className={cn("text-[10px] uppercase font-black tracking-[0.5em] mb-4 opacity-50", selectedTemplate.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>Wedding Invitation</p>
                          <h2 className={cn("text-5xl lg:text-7xl font-black italic tracking-tighter leading-[0.8] mb-2 flex flex-col", selectedTemplate.font, selectedTemplate.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>
                            <span>{cardData.groom}</span>
                            <span className="text-2xl not-italic opacity-30 my-4">&</span>
                            <span>{cardData.bride}</span>
                          </h2>
                       </div>
                       
                       <p className={cn("text-[12px] font-bold max-w-[280px] mx-auto leading-relaxed opacity-60 uppercase tracking-widest font-serif italic italic font-serif", selectedTemplate.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>
                         "{cardData.message}"
                       </p>
                    </div>

                    <div className="relative pt-12">
                       <div className="grid grid-cols-1 gap-2 border-t border-white/10 pt-10">
                          <p className={cn("text-lg font-black tracking-widest uppercase", selectedTemplate.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>{cardData.date}</p>
                          <div className="flex items-center justify-center space-x-6 opacity-60">
                             <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3" />
                                <span className={cn("text-[9px] font-black uppercase", selectedTemplate.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>{cardData.time}</span>
                             </div>
                             <div className="flex items-center space-x-2">
                                <MapPin className="w-3 h-3" />
                                <span className={cn("text-[9px] font-black uppercase truncate max-w-[100px]", selectedTemplate.textColor.includes('#F') ? 'text-white' : 'text-gray-900')}>{cardData.venue}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Controls - Right */}
            <div className="lg:w-[55%] space-y-16 lg:pt-10 pb-40">
               <div>
                  <div className="flex items-center space-x-4 mb-10">
                     <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center">
                        <Palette className="w-5 h-5" />
                     </div>
                     <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Personalize Details</h4>
                  </div>

                  <div className="grid gap-10">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Groom Name</label>
                          <input 
                            value={cardData.groom} 
                            placeholder="Enter groom's name"
                            onChange={(e) => setCardData({...cardData, groom: e.target.value})}
                            className="w-full h-16 bg-white border border-gray-100 rounded-2xl px-6 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-pink-50 transition-all shadow-sm"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Bride Name</label>
                          <input 
                            value={cardData.bride} 
                            placeholder="Enter bride's name"
                            onChange={(e) => setCardData({...cardData, bride: e.target.value})}
                            className="w-full h-16 bg-white border border-gray-100 rounded-2xl px-6 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-pink-50 transition-all shadow-sm"
                          />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between pl-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invitation Vows / Message</label>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              setGeneratingAI(true);
                              setAiOptions([]);
                              try {
                                const prompt = `Create a short, poetic wedding invitation message for ${cardData.groom} and ${cardData.bride}. Style: ${selectedTemplate.name}. Keep it under 25 words.`;
                                const options = await generateInvitationContent(prompt);
                                setAiOptions(options);
                                toast.success('Designer AI composed 3 options!', { icon: '✨' });
                              } catch (e) {
                                toast.error('AI generation failed');
                              } finally {
                                setGeneratingAI(false);
                              }
                            }}
                            disabled={generatingAI}
                            className="flex items-center space-x-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-100 disabled:opacity-50 transition-all"
                          >
                            {generatingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                            <span>AI Studio Assist</span>
                          </motion.button>
                       </div>

                       <AnimatePresence>
                         {aiOptions.length > 0 && (
                           <motion.div 
                            key="ai-options-panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-1 gap-4 overflow-hidden mb-6"
                           >
                             {aiOptions.map((opt, idx) => (
                               <button
                                 key={idx}
                                 onClick={() => {
                                   setCardData(prev => ({ ...prev, message: opt }));
                                   setAiOptions([]);
                                 }}
                                 className="p-6 bg-white border border-pink-50 rounded-3xl text-left hover:border-pink-300 transition-all shadow-sm hover:shadow-xl group relative overflow-hidden"
                               >
                                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-pink-600 transition-all">
                                   <Sparkles className="w-5 h-5" />
                                 </div>
                                 <p className="text-[12px] font-bold text-gray-600 italic leading-relaxed pr-10">"{opt}"</p>
                               </button>
                             ))}
                           </motion.div>
                         )}
                       </AnimatePresence>

                       <textarea 
                         rows={4}
                         placeholder="Craft a message that echoes forever..."
                         value={cardData.message} 
                         onChange={(e) => setCardData({...cardData, message: e.target.value})}
                         className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-pink-50 transition-all resize-none shadow-sm h-40"
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Celestial Venue</label>
                       <div className="relative">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            value={cardData.venue} 
                            placeholder="Where will the unions take place?"
                            onChange={(e) => setCardData({...cardData, venue: e.target.value})}
                            className="w-full h-16 bg-white border border-gray-100 rounded-2xl pl-14 pr-6 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-pink-50 transition-all shadow-sm"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sacred Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input 
                              value={cardData.date} 
                              onChange={(e) => setCardData({...cardData, date: e.target.value})}
                              className="w-full h-16 bg-white border border-gray-100 rounded-2xl pl-14 pr-6 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-pink-50 transition-all shadow-sm"
                            />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sacred Time</label>
                          <div className="relative">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input 
                              value={cardData.time} 
                              onChange={(e) => setCardData({...cardData, time: e.target.value})}
                              className="w-full h-16 bg-white border border-gray-100 rounded-2xl pl-14 pr-6 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-pink-50 transition-all shadow-sm"
                            />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="pt-12 border-t border-gray-100 flex gap-6">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 h-20 bg-gray-50 border border-gray-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-pink-600 transition-all"
                  >
                    Reselect Template
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="flex-[2] h-20 bg-gray-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-2xl shadow-pink-100 flex items-center justify-center group"
                  >
                    Confirm & Choose Guests 
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                       <ChevronRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="send"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="grid lg:grid-cols-3 gap-12"
          >
            {/* Selection Area */}
            <div className="lg:col-span-2 space-y-10">
               <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                     <div>
                        <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic lg:text-4xl">Select Recipients</h4>
                        <p className="text-[10px] font-bold text-pink-600 uppercase tracking-[0.2em] mt-2">{selectedGuests.length} Selected • {guests.length} Available In List</p>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            placeholder="Find guest..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-50 h-12 pl-12 pr-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-pink-100 transition-all min-w-[200px]"
                          />
                        </div>
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                           <button 
                             onClick={() => setSelectedGuests(guests.map(g => g.id))}
                             className="px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-pink-600 transition-colors"
                           >
                             Select All
                           </button>
                           <div className="w-[1px] h-4 bg-gray-200 mt-2" />
                           <button 
                             onClick={() => setSelectedGuests([])}
                             className="px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-pink-600 transition-colors"
                           >
                             Clear
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="relative z-10 flex flex-wrap gap-2 mb-8">
                    {guestCategories.map((cat, idx) => (
                      <button
                        key={cat || `cat-${idx}`}
                        onClick={() => setFilterCategory(cat || 'All')}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                          filterCategory === (cat || 'All') ? "bg-gray-900 text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        {cat || 'Uncategorized'}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
                    {filteredGuests.length > 0 ? filteredGuests.map((guest, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        key={guest.id || `guest-${idx}`}
                        onClick={() => toggleGuest(guest.id)}
                        className={cn(
                          "p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer flex items-center justify-between group",
                          selectedGuests.includes(guest.id) 
                            ? "bg-pink-50 border-pink-200 shadow-xl shadow-pink-100/20 scale-[1.02]" 
                            : "bg-white border-gray-100 hover:border-pink-100 hover:bg-gray-50/50"
                        )}
                      >
                        <div className="flex items-center space-x-5">
                           <div className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black italic shadow-inner transition-all duration-500",
                             selectedGuests.includes(guest.id) ? "bg-pink-600 text-white rotate-6" : "bg-gray-100 text-gray-300"
                           )}>
                             {guest.name[0]}
                           </div>
                           <div>
                              <p className="text-[13px] font-black text-gray-900 uppercase tracking-tight leading-none mb-2">{guest.name}</p>
                              <div className="flex items-center space-x-3 opacity-60">
                                 {guest.email && <Mail className="w-3.5 h-3.5 text-gray-400" />}
                                 {guest.phone && <Phone className="w-3.5 h-3.5 text-gray-400" />}
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{guest.category}</span>
                              </div>
                           </div>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-500",
                          selectedGuests.includes(guest.id) ? "bg-pink-600 border-pink-600" : "border-gray-200"
                        )}>
                          {selectedGuests.includes(guest.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="col-span-full py-40 text-center space-y-6">
                         <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto ring-8 ring-gray-50/50">
                            <Users className="w-10 h-10 text-gray-200" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">No guests found</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Adjust your filters or add new guests.</p>
                         </div>
                         <Link to="/guest-list" className="inline-flex items-center px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl">Add New Guest</Link>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Final Confirmation */}
            <div className="space-y-8">
               <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/20 rounded-full blur-3xl" />
                  <h4 className="text-xl font-black italic tracking-tighter mb-8 uppercase">Ready to dispatch</h4>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Design</span>
                       <span className="text-[10px] font-black uppercase">{selectedTemplate.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipients</span>
                       <span className="text-[10px] font-black uppercase">{selectedGuests.length} Selected</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Channels</span>
                       <div className="flex gap-2">
                          <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center"><Mail className="w-3 h-3" /></div>
                          <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center"><Phone className="w-3 h-3" /></div>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSend}
                    disabled={sending || selectedGuests.length === 0}
                    className="w-full h-16 bg-pink-600 text-white rounded-3xl font-black text-[12px] uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-900/20 flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                  >
                    {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        Broadcast Invites <Send className="w-4 h-4 ml-3" />
                      </>
                    )}
                  </button>
               </div>

               <div className="bg-pink-50 p-8 rounded-[2.5rem] border border-pink-100">
                  <div className="flex items-start space-x-4">
                     <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-pink-600" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-2">Pro Tip</p>
                        <p className="text-[10px] text-gray-500 font-medium italic leading-relaxed">
                          "Each guest will receive a personalized digital version of your card. We'll automatically include their name on the greeting!"
                        </p>
                     </div>
                  </div>
               </div>
            </div>
           </motion.div>
         )}
         {step === 4 && (
           <motion.div 
             key="history"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
           >
             <HistoryTab 
                invitationsHistory={invitationsHistory}
                selectedHistoryItems={selectedHistoryItems}
                isDeleting={isDeleting}
                expandedHistory={expandedHistory}
                guests={guests}
                onClearAll={handleClearAllHistory}
                onDeleteSelection={handleDeleteHistory}
                onSelectAll={handleSelectAllHistory}
                onToggleSelection={toggleHistorySelection}
                onToggleExpand={toggleHistory}
                onReuse={(inv) => {
                  setCardData(inv.cardData);
                  setSelectedTemplate(INVITATION_TEMPLATES.find(t => t.id === inv.templateId) || INVITATION_TEMPLATES[0]);
                  setStep(2);
                }}
                onDeleteIndividual={(id) => handleDeleteHistory([id], false)}
                onManualDelivery={(inv, guestInfo) => {
                  const personalizedLink = `${window.location.origin}/invite/${inv.id}?g=${encodeURIComponent(guestInfo?.name || '')}`;
                  const waText = encodeURIComponent(`🕉️ *WEDDING INVITATION* 🕉️\n\nDearest *${guestInfo?.name}*,\n\nYou're cordially invited to celebrate the union of *${inv.cardData.groom}* & *${inv.cardData.bride}*.\n\n✨ View My Personalized Invite ✨\n${personalizedLink}\n\nCan't wait to see you there!`);
                  window.open(`https://wa.me/${guestInfo?.phone?.replace(/\D/g,'')}?text=${waText}`, '_blank');
                  handleManualDelivery(inv.id, guestInfo?.id, guestInfo?.email);
                }}
             />
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
