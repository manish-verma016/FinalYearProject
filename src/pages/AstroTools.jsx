import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, Clock, Search, Wand2, Star, Calendar, Save, Trash2, 
  Loader2, Download, MapPin, Moon, Sun, ChevronRight, ChevronLeft,
  AlertCircle, ShieldCheck, User
} from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { useLocation } from 'react-router-dom';
import { generateAstroReading } from '../lib/astroService';
import WeddingCalendar from '../components/WeddingCalendar';
import { PRIMARY_VENUES } from '../data/venuesData';

const PANCHANG_DATA = {
  tithi: 'Shukla Paksha Shashthi',
  nakshatra: 'Pushya (Most Auspicious)',
  yoga: 'Siddha',
  karana: 'Kaulava',
  rahuKaal: '04:30 PM - 06:12 PM',
  gulika: '03:15 PM - 04:30 PM',
};

export default function AstroTools() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.state && location.state.tab) {
      return location.state.tab;
    }
    return 'match';
  });

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronized target event dates mapped by venueId -> date string
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
      toast.success(`Target event date updated in database & calendar!`, { id: `date-saved-${venueId}`, duration: 2500 });
    } else {
      toast.success(`Target date cleared.`, { id: `date-cleared-${venueId}`, duration: 2000 });
    }
  };

  const [matchData, setMatchData] = useState({
    groomName: '',
    groomDob: '',
    groomTime: '12:00',
    groomPlace: '',
    brideName: '',
    brideDob: '',
    brideTime: '12:00',
    bridePlace: '',
  });

  const [muhurutData, setMuhurutData] = useState({
    month: 'May 2026',
    eventType: 'Wedding',
  });

  const saveResult = async () => {
    if (!user || !result) {
      toast.error('Please sign in to save results');
      return;
    }
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'astro_results'), {
        userId: user.uid,
        type: result.type,
        data: result,
        names: activeTab === 'match' ? { 
          groom: matchData.groomName, 
          bride: matchData.brideName 
        } : null,
        createdAt: serverTimestamp(),
      });
      toast.success('Reading successfully archived in your vault!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save to cosmic vault');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateCompatibility = async () => {
    if (!matchData.groomName || !matchData.brideName) {
      toast.error('Please enter both Groom and Bride names.');
      return;
    }

    setIsCalculating(true);
    setResult(null);
    
    // Deterministic score based on names
    const combinedNames = (matchData.groomName + matchData.brideName).toLowerCase().replace(/\s/g, '');
    let charSum = 0;
    for (let i = 0; i < combinedNames.length; i++) charSum += combinedNames.charCodeAt(i);
    const score = 18 + (charSum % 19); // Result between 18 and 36
    
    let verdict = 'Graceful Union';
    if (score >= 32) verdict = 'Divine Alignment';
    else if (score >= 28) verdict = 'Highly Harmonious';
    else if (score >= 21) verdict = 'Stable Connection';
    else verdict = 'Challenging Orbit';

    const aiResult = await generateAstroReading('match', { ...matchData, score });

    setResult({
      type: 'match',
      score,
      verdict,
      metrics: [
        { label: 'Spiritual Sync', value: 70 + (charSum % 25) },
        { label: 'Karmic Weight', value: 50 + (charSum % 40) },
        { label: 'Financial Growth', value: 40 + (charSum % 50) },
        { label: 'Progeny Potency', value: 65 + (charSum % 30) },
      ],
      gunas: [
        { name: 'Varna', score: '1/1', desc: 'Working Ego Sync' },
        { name: 'Vashya', score: '2/2', desc: 'Dominance & Attraction' },
        { name: 'Tara', score: '1.5/3', desc: 'Longevity & Health' },
        { name: 'Yoni', score: '4/4', desc: 'Physical Chemistry' },
        { name: 'Maitri', score: '5/5', desc: 'Friendship & Intellect' },
        { name: 'Gana', score: '3/6', desc: 'Temperamental Tuning' },
        { name: 'Bhakut', score: '7/7', desc: 'Prosperity & Expansion' },
        { name: 'Nadi', score: '8/8', desc: 'Genetic/Progeny Health' },
      ],
      manglik: {
        groom: matchData.groomTime.includes('0') ? 'Strong Manglik' : 'No Dosha',
        bride: matchData.brideTime.includes('1') ? 'Anshik Manglik' : 'No Dosha',
        advice: aiResult?.manglikAdvice || 'Planetary remedies suggested for the second house transit.'
      },
      summary: aiResult?.summary || 'The birth charts reveal a promising alignment for long-term prosperity.',
      blessing: aiResult?.blessing || 'May the stars guide your journey.'
    });
    setIsCalculating(false);
    toast.success('Alignment Calculated!');
  };

  const handleMuhurutFind = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setResult(null);

    // Call astorservice to get reading
    const aiResult = await generateAstroReading('muhurut', { ...muhurutData });

    setTimeout(() => {
      setIsCalculating(false);
      setResult({
        type: 'muhurut',
        dates: [
          { 
            date: '12th May 2026', 
            time: '10:30 AM - 01:45 PM', 
            tithi: 'Shukla Paksha Dashami',
            nakshatra: 'Pushya',
            yoga: 'Vridhi',
            rating: 5
          },
          { 
            date: '18th May 2026', 
            time: '06:15 PM - 09:30 PM', 
            tithi: 'Shukla Paksha Trayodashi',
            nakshatra: 'Rohini',
            yoga: 'Siddhi',
            rating: 4.8
          },
          { 
            date: '25th May 2026', 
            time: '08:45 AM - 12:00 PM', 
            tithi: 'Krishna Paksha Pratipada',
            nakshatra: 'Magha',
            yoga: 'Shubha',
            rating: 4.2
          },
        ],
        planetaryPositions: [
          { planet: 'Jupiter', status: 'Exalted in Cancer', effect: 'Blesses longevity and wisdom' },
          { planet: 'Venus', status: 'Kendra Sthana', effect: 'Enhances marital luxury and romance' },
          { planet: 'Mars', status: 'Retrograde', effect: 'Caution: Avoid arguments during the ritual' },
        ],
        detailedAdvice: aiResult?.advice ? [aiResult.advice] : [
          'The first date is highly recommended as it falls under Pushya, the King of Nakshatras.',
          'Mercury remains stable during these windows, ensuring effective communication during the vows.',
          'For maximum blessing, distribute yellow sweets to 7 scholars on the chosen date.'
        ]
      });
      toast.success('Divine Intervals Located!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030408] text-white relative overflow-hidden pt-36 pb-20 font-sans">
      {/* Background starlight dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(226,168,87,0.06),transparent_60%)]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/40 rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: 2 + Math.random() * 4 + 's',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Header Row with Title and Tab Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#e2a857] tracking-normal font-medium mb-2">
              Astro Intelligence
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              Ancient wisdom synchronized with modern life.
            </p>
          </div>

          {/* Premium gold pill switcher */}
          <div className="flex bg-[#12131a] p-1.5 rounded-full border border-zinc-800/60 sticky-tabs self-start md:self-auto">
            <button
              onClick={() => { setActiveTab('match'); setResult(null); }}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                activeTab === 'match'
                  ? "bg-[#e2a857] text-[#030408] shadow-lg"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Celestial Matching
            </button>
            <button
              onClick={() => { setActiveTab('muhurut'); setResult(null); }}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                activeTab === 'muhurut'
                  ? "bg-[#e2a857] text-[#030408] shadow-lg"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Muhurut Finder
            </button>
            <button
              onClick={() => { setActiveTab('calendar'); setResult(null); }}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                activeTab === 'calendar'
                  ? "bg-[#e2a857] text-[#030408] shadow-lg"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Celebration Calendar 🌟
            </button>
          </div>
        </div>

        {/* Content Layout */}
        {activeTab === 'calendar' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full text-gray-900 bg-white rounded-[3.5rem] p-6 md:p-10 shadow-2xl border border-zinc-100"
          >
            <div className="mb-6 pb-6 border-b border-gray-150">
               <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic font-serif">Celestial Celebration Schedule</h2>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Overlay Astro Muhurats & Coordinate Site Visits</p>
            </div>
            <WeddingCalendar
              venueDates={venueDates}
              onSaveVenueDate={handleSaveVenueDate}
              venuesList={PRIMARY_VENUES}
            />
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main workspace */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'match' ? (
                <motion.div
                  key="match-profile-box"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-10">
                    
                    {/* Groom Profile Column */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 border-b border-zinc-800/40 pb-4 mb-4">
                        <User className="w-5 h-5 text-[#e2a857]" />
                        <h3 className="text-sm font-black text-[#e2a857] uppercase tracking-[0.2em]">
                          Groom Profile
                        </h3>
                      </div>

                      <InputField 
                        label="Legal Name" 
                        placeholder="e.g. Rahul Sharma" 
                        value={matchData.groomName}
                        onChange={(val) => setMatchData({ ...matchData, groomName: val })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <InputField 
                          label="Birth Date" 
                          type="date"
                          value={matchData.groomDob}
                          onChange={(val) => setMatchData({ ...matchData, groomDob: val })}
                        />
                        <InputField 
                          label="Birth Time" 
                          type="time"
                          value={matchData.groomTime}
                          onChange={(val) => setMatchData({ ...matchData, groomTime: val })}
                        />
                      </div>

                      <InputField 
                        label="Birth Location" 
                        placeholder="e.g. New Delhi, India" 
                        value={matchData.groomPlace}
                        onChange={(val) => setMatchData({ ...matchData, groomPlace: val })}
                      />
                    </div>

                    {/* Bride Profile Column */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 border-b border-zinc-800/40 pb-4 mb-4">
                        <User className="w-5 h-5 text-[#E26D5C]" />
                        <h3 className="text-sm font-black text-[#E26D5C] uppercase tracking-[0.2em]">
                          Bride Profile
                        </h3>
                      </div>

                      <InputField 
                        label="Legal Name" 
                        placeholder="e.g. Anjali Gupta" 
                        value={matchData.brideName}
                        onChange={(val) => setMatchData({ ...matchData, brideName: val })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <InputField 
                          label="Birth Date" 
                          type="date"
                          value={matchData.brideDob}
                          onChange={(val) => setMatchData({ ...matchData, brideDob: val })}
                        />
                        <InputField 
                          label="Birth Time" 
                          type="time"
                          value={matchData.brideTime}
                          onChange={(val) => setMatchData({ ...matchData, brideTime: val })}
                        />
                      </div>

                      <InputField 
                        label="Birth Location" 
                        placeholder="e.g. Mumbai, India" 
                        value={matchData.bridePlace}
                        onChange={(val) => setMatchData({ ...matchData, bridePlace: val })}
                      />
                    </div>

                  </div>

                  {/* Consult Button at bottom of card */}
                  <div className="mt-10 pt-6 border-t border-zinc-800/40">
                    <button
                      onClick={calculateCompatibility}
                      disabled={isCalculating}
                      className="w-full h-14 bg-[#e2a857] hover:bg-[#c9954b] text-[#030408] font-extrabold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                    >
                      {isCalculating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-3 text-[#030408]" />
                          <span>Aligning Stars...</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-3 fill-black text-black" />
                          <span>Consult Vedic Oracle</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="muhurut-custom-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleMuhurutFind}
                  className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden space-y-8"
                >
                  <div className="border-b border-zinc-800/40 pb-4 mb-4">
                    <h3 className="text-sm font-black text-[#e2a857] uppercase tracking-[0.2em] flex items-center">
                      <Clock className="w-5 h-5 mr-3" /> Auspicious Windows (Muhurut)
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Target Month</label>
                      <select
                        className="w-full px-5 py-4 bg-[#1a1b24] border border-zinc-800/80 rounded-xl outline-none text-sm text-white focus:border-[#e2a857] appearance-none cursor-pointer"
                        value={muhurutData.month}
                        onChange={(e) => setMuhurutData({ ...muhurutData, month: e.target.value })}
                      >
                        <option value="January 2026">January 2026</option>
                        <option value="May 2026">May 2026</option>
                        <option value="November 2026">November 2026</option>
                        <option value="December 2026">December 2026</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Ceremony / Ritual Type</label>
                      <select
                        className="w-full px-5 py-4 bg-[#1a1b24] border border-zinc-800/80 rounded-xl outline-none text-sm text-white focus:border-[#e2a857] appearance-none cursor-pointer"
                        value={muhurutData.eventType}
                        onChange={(e) => setMuhurutData({ ...muhurutData, eventType: e.target.value })}
                      >
                        <option value="Wedding">Wedding (Vivah)</option>
                        <option value="Engagement">Engagement (Sagai)</option>
                        <option value="Sangeet">Sangeet / Mehendi</option>
                        <option value="Home Entry">Griha Pravesh</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full h-14 bg-[#e2a857] hover:bg-[#c9954b] text-[#030408] font-extrabold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center transition-all disabled:opacity-50 mt-6"
                  >
                    {isCalculating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#030408]" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-3" />
                        <span>Explore Auspicious Windows</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Results Grid / Box dynamically displayed */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 mt-12"
                >
                  {result.type === 'match' ? (
                    <div className="space-y-8">
                      {/* Overall Verdict Card */}
                      <div className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-6 right-6 flex gap-2">
                          <button 
                            onClick={saveResult}
                            disabled={isSaving}
                            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-zinc-800 text-gray-400 hover:text-white hover:border-[#e2a857] transition-all"
                            title="Save to Cosmic Vault"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                          {/* Circle Progress Score */}
                          <div className="w-32 h-32 rounded-full border-4 border-dashed border-[#e2a857]/40 flex items-center justify-center bg-[#e2a857]/5 shadow-[0_0_30px_rgba(226,168,87,0.15)] shrink-0">
                            <div className="text-center">
                              <span className="text-4xl font-black text-white">{result.score}</span>
                              <span className="block text-[8px] uppercase text-gray-400 tracking-wider">Gunas</span>
                            </div>
                          </div>

                          {/* Verdict Summary Text */}
                          <div className="space-y-2">
                            <span className="px-2.5 py-1 bg-[#e2a857]/10 text-[#e2a857] text-[9px] font-black uppercase tracking-wider rounded-md border border-[#e2a857]/20">
                              {result.verdict}
                            </span>
                            <h4 className="text-xl font-bold font-serif text-[#e2a857] leading-tight">
                              Ancestral Alignment Score: {result.score} / 36
                            </h4>
                            <p className="text-sm text-gray-400 italic leading-relaxed">
                              "{result.summary}"
                            </p>
                          </div>
                        </div>

                        {/* Elder Blessing Quote box */}
                        <div className="mt-6 p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/40 text-xs italic text-[#e2a857] flex items-center gap-3">
                          <Sparkles className="w-4 h-4 shrink-0 text-[#e2a857]" />
                          <span>Celestial Blessing: {result.blessing}</span>
                        </div>
                      </div>

                      {/* Alignments Breakdown and Doshas */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Alignment checklist */}
                        <div className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-6 space-y-5">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#e2a857] flex items-center">
                            <ShieldCheck className="w-4 h-4 mr-2" /> Alignment Breakdown
                          </h4>
                          <div className="space-y-4">
                            {result.metrics.map(m => (
                              <div key={m.label} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-gray-400">
                                  <span>{m.label}</span>
                                  <span className="text-[#e2a857]">{m.value}%</span>
                                </div>
                                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#e2a857] rounded-full" style={{ width: `${m.value}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Doshas detail */}
                        <div className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-6 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" /> Dosha Check
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
                              <span className="text-xs text-gray-400 lowercase first-letter:uppercase">Groom Dosha status</span>
                              <span className={cn("text-xs font-bold", result.manglik.groom.includes('No') ? 'text-green-500' : 'text-orange-400')}>{result.manglik.groom}</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
                              <span className="text-xs text-gray-400 lowercase first-letter:uppercase">Bride Dosha status</span>
                              <span className={cn("text-xs font-bold", result.manglik.bride.includes('No') ? 'text-green-500' : 'text-orange-400')}>{result.manglik.bride}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed italic">
                            "{result.manglik.advice}"
                          </p>
                        </div>
                      </div>

                      {/* Traditional Ashtakuta Guna Chart Table */}
                      <div className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-6 md:p-8 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-800/40">
                          <span className="text-xs font-black uppercase tracking-widest text-[#e2a857]">Ashtakuta Detailed Table</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">8 Cosmic Kutas</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {result.gunas.map(g => (
                            <div key={g.name} className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-850 text-center">
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{g.name}</span>
                              <span className="text-lg font-black text-white">{g.score}</span>
                              <span className="block text-[8px] text-zinc-500 uppercase mt-1.5 leading-tight">{g.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Muhurut results */
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {result.dates.map((d, i) => (
                          <div 
                            key={i}
                            className="bg-[#12131a] border border-zinc-800/50 hover:border-[#e2a857]/40 p-6 rounded-3xl transition-all relative overflow-hidden group"
                          >
                            <div className="flex items-center space-x-1 absolute top-4 right-4 text-[#e2a857]">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className={cn("w-3 h-3", j < Math.floor(d.rating) ? "fill-[#e2a857] text-[#e2a857]" : "text-zinc-800")} />
                              ))}
                            </div>
                            <span className="block text-2xl font-serif text-[#e2a857] mb-2">{d.date}</span>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">{d.time}</span>
                            <div className="border-t border-zinc-800/50 pt-3 space-y-1.5 text-[11px] text-gray-400 flex flex-col">
                              <div className="flex justify-between"><span>Tithi</span><span className="text-white font-medium">{d.tithi}</span></div>
                              <div className="flex justify-between"><span>Nakshatra</span><span className="text-[#ff529a] font-medium">{d.nakshatra}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Archarya advice */}
                      <div className="bg-[#12131a] border border-zinc-800/50 p-6 rounded-3xl">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#e2a857] mb-4">Astral Wisdom and Guidance</h4>
                        <div className="space-y-3">
                          {result.detailedAdvice.map((a, idx) => (
                            <div key={idx} className="flex gap-3 text-sm text-gray-400 leading-relaxed italic">
                              <span className="text-[#e2a857] shrink-0">🕉️</span>
                              <span>"{a}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Widgets (Column span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Panchang Widget */}
            <div className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/40">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#e2a857] flex items-center">
                  <Sun className="w-4 h-4 mr-2 text-amber-500 animate-spin-slow" /> Daily Panchang
                </h3>
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Full View</span>
              </div>
              <div className="space-y-4">
                <PanchangItem label="Tithi" value={PANCHANG_DATA.tithi} />
                <PanchangItem label="Nakshatra" value={PANCHANG_DATA.nakshatra} highlight />
                <PanchangItem label="Yoga" value={PANCHANG_DATA.yoga} />
                <PanchangItem label="Rahu Kaal" value={PANCHANG_DATA.rahuKaal} danger />
              </div>
            </div>

            {/* Transit Alert Notification card */}
            <div className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-[#ff8040] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#ff8040]">Transit Alert</h4>
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    "Mars entering Aries next week. Ideal for fixing engagement dates to ensure dynamic energy."
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links / Archived Items */}
            <div className="bg-[#12131a] border border-zinc-800/50 rounded-3xl p-6 space-y-4">
              <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Archived Alignments</span>
              <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850 hover:border-[#e2a857]/20 cursor-pointer transition-all group">
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-[#e2a857] shrink-0 opacity-60" />
                  <span className="text-xs font-bold text-gray-300 uppercase">Rahul & Anjali</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#e2a857] transition-all" />
              </div>
            </div>

          </div>

        </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div className="space-y-2 font-sans">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1b24] border border-zinc-800/80 rounded-xl px-4 py-3.5 outline-none text-sm text-gray-200 focus:border-[#e2a857] focus:bg-[#20212d] transition-colors"
      />
    </div>
  );
}

function PanchangItem({ label, value, highlight, danger }) {
  return (
    <div className="flex justify-between items-center py-1.5 font-sans">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={cn(
        "text-xs font-extrabold text-right",
        highlight ? "text-[#ff529a]" : danger ? "text-[#fc5353]" : "text-white"
      )}>
        {value}
      </span>
    </div>
  );
}
