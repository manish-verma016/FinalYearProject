import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Save, Calendar, Heart, Send, Bot, User, Download } from 'lucide-react';
import { generateWeddingItinerary, chatWithPlanner } from '../lib/geminiService';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

export default function AIPlanner() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [config, setConfig] = useState({
    style: 'Royal Heritage',
    guestCount: 'Under 50',
    budgetRange: 'Premium',
  });
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please sign in to generate an itinerary');
      return;
    }
    setLoading(true);
    try {
      const result = await generateWeddingItinerary(config);
      setItinerary(result || null);
      toast.success('Your dream itinerary is ready!');
    } catch (error) {
      toast.error('Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (text = userInput) => {
    if (!text.trim() || loading) return;
    
    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await chatWithPlanner(text, messages.map(m => ({ role: m.role, content: m.content })));
      
      const parts = response.split('Try asking:');
      const content = parts[0].trim();
      const suggestions = parts[1] ? parts[1].split('\n').filter(s => s.trim()).map(s => s.replace(/^\d+\.\s*/, '').trim()) : [];

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
        suggestions
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      toast.error('Gathbandhan AI is momentarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async () => {
    if (!user || !itinerary) return;
    try {
      await addDoc(collection(db, 'itineraries'), {
        userId: user.uid,
        style: config.style,
        guestCount: config.guestCount,
        budgetRange: config.budgetRange,
        content: itinerary,
        createdAt: serverTimestamp()
      });
      toast.success('Itinerary saved to your profile!');
    } catch (error) {
      toast.error('Failed to save itinerary');
      console.error(error);
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Mode Selector */}
      <div className="flex justify-center mb-12">
        <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex">
          <button
            onClick={() => setActiveMode('generate')}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center",
              activeMode === 'generate' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"
            )}
          >
            <Calendar className="w-4 h-4 mr-2" /> Auto Planner
          </button>
          <button
            onClick={() => setActiveMode('chat')}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center",
              activeMode === 'chat' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"
            )}
          >
            <Bot className="w-4 h-4 mr-2" /> Expert Chat
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'generate' ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="bg-white rounded-[3.5rem] p-12 lg:p-20 shadow-2xl shadow-pink-100/20 border border-gray-50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-50" />
               
               <div className="relative z-10">
                  <div className="flex items-center space-x-6 mb-16">
                    <div className="w-16 h-16 bg-[#E50478] rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-pink-200">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Craft Your Itinerary</h2>
                      <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em]">Signature Gemini Intelligence</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-10 mb-16">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Wedding Style</label>
                      <select
                        value={config.style}
                        onChange={(e) => setConfig({ ...config, style: e.target.value })}
                        className="w-full h-16 px-6 bg-gray-50 border border-transparent rounded-2xl appearance-none focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all font-bold text-gray-700 text-sm outline-none cursor-pointer"
                      >
                        {['Royal Heritage', 'Modern Minimalist', 'Beach Destination', 'Traditional Vedic', 'Boho Chic'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Guest Count</label>
                      <select
                        value={config.guestCount}
                        onChange={(e) => setConfig({ ...config, guestCount: e.target.value })}
                        className="w-full h-16 px-6 bg-gray-50 border border-transparent rounded-2xl appearance-none focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all font-bold text-gray-700 text-sm outline-none cursor-pointer"
                      >
                        {['Under 50', '50 - 200', '200 - 500', '500+'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Budget Range</label>
                      <select
                        value={config.budgetRange}
                        onChange={(e) => setConfig({ ...config, budgetRange: e.target.value })}
                        className="w-full h-16 px-6 bg-gray-50 border border-transparent rounded-2xl appearance-none focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all font-bold text-gray-700 text-sm outline-none cursor-pointer"
                      >
                        {['Budget Friendly', 'Standard', 'Premium', 'Luxury'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-gray-900 text-white h-20 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-[#E50478] transition-all flex items-center justify-center shadow-2xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create My Dream Wedding Plan'}
                  </button>
               </div>
            </div>

            {itinerary && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3.5rem] p-12 lg:p-20 shadow-2xl border border-gray-50"
              >
                <div className="flex justify-between items-center mb-12 pb-8 border-b border-gray-50">
                   <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center">
                        <Heart className="w-7 h-7 text-pink-600 fill-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Personalized Itinerary</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3 Days of Celebration</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={saveItinerary}
                        className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-all" 
                        title="Save"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-all" title="Download">
                        <Download className="w-5 h-5" />
                      </button>
                   </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-1">
                    <div className="prose prose-pink max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-gray-600 prose-li:text-gray-600">
                      <Markdown>{itinerary}</Markdown>
                    </div>
                  </div>
                  
                  {/* Highlights Sidebar */}
                  <div className="lg:w-80 space-y-8">
                     <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Key Highlights</h4>
                        <ul className="space-y-4">
                           {itinerary.split('\n').filter(l => l.includes('Day') || l.includes('Ceremony')).slice(0, 5).map((point, i) => (
                             <li key={i} className="flex items-start space-x-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-pink-600 rounded-full flex-shrink-0" />
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-none truncate">{point.replace(/[#*]/g, '')}</span>
                             </li>
                           ))}
                        </ul>
                     </div>

                     <div className="bg-pink-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <Sparkles className="absolute top-2 right-2 w-16 h-16 opacity-10 group-hover:scale-125 transition-transform" />
                        <h4 className="text-xl font-black italic tracking-tighter mb-4">Find Vendors</h4>
                        <p className="text-[9px] font-bold text-pink-100 uppercase tracking-widest leading-relaxed mb-6">Matching {config.style} services near you</p>
                        <Link 
                          to="/services" 
                          className="w-full h-12 bg-white text-pink-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-xl"
                        >
                          Explore Now
                        </Link>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-[700px] bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 overflow-hidden"
          >
            <div className="p-8 bg-gray-900 text-white flex items-center space-x-6 border-b border-white/5">
               <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                 <Bot className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-black text-xl italic uppercase tracking-tighter">AI Wedding Expert</h3>
                  <p className="text-[9px] font-bold text-pink-400 uppercase tracking-[0.2em] animate-pulse">Online & Ready to assist</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
               {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-pink-50 rounded-[2rem] flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Hello, I am Gathbandhan AI</h4>
                      <p className="text-sm text-gray-400 max-w-xs font-medium">Ask me about venues in Aligarh, Vedic rituals, or trending wedding decor themes!</p>
                    </div>
                 </div>
               )}
               {messages.map((msg) => (
                 <motion.div
                   initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   key={msg.id}
                   className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
                 >
                    <div className={cn(
                      "max-w-[80%] p-6 rounded-[2rem]",
                      msg.role === 'user' ? "bg-pink-600 text-white rounded-tr-none" : "bg-gray-50 text-gray-800 rounded-tl-none"
                    )}>
                       <div className="flex items-center gap-3 mb-3">
                          {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-pink-600" /> : <User className="w-4 h-4" />}
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {msg.role === 'assistant' ? 'Planner' : 'You'}
                          </span>
                       </div>
                       <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-0 prose-invert">
                          <Markdown>{msg.content}</Markdown>
                       </div>
                       
                       {msg.suggestions && msg.suggestions.length > 0 && (
                         <div className="mt-6 flex flex-wrap gap-2">
                           {msg.suggestions.map((s, i) => (
                             <button
                               disabled={loading}
                               key={i}
                               onClick={() => handleChat(s)}
                               className="bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 transition-all"
                             >
                               {s}
                             </button>
                           ))}
                         </div>
                       )}
                    </div>
                 </motion.div>
               ))}
               <div ref={chatEndRef} />
            </div>

            <div className="p-8 bg-white border-t border-gray-50">
               <div className="relative">
                  <input
                    type="text"
                    value={userInput}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask anything about your wedding planning..."
                    className="w-full h-16 pl-8 pr-20 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all font-medium text-sm text-gray-800 outline-none"
                  />
                  <button
                    onClick={() => handleChat()}
                    disabled={!userInput.trim() || loading}
                    className="absolute right-3 top-3 w-10 h-10 bg-gray-900 hover:bg-pink-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
