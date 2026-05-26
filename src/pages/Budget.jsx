import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  Wallet, TrendingUp, Sparkles, Plus, Trash2, Edit2, Check, X,
  AlertOctagon, Calendar, CheckCircle2, IndianRupee, PieChart as ChartIcon,
  Download, RefreshCw, Landmark, HelpCircle, FileSpreadsheet, ArrowUpRight,
  Users
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const CATEGORY_META = {
  venue: { label: 'Venue & Stays', color: '#E50478', bgColor: 'bg-pink-50', textColor: 'text-pink-600', borderColor: 'border-pink-200' },
  catering: { label: 'Food & Catering', color: '#F59E0B', bgColor: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-200' },
  decor: { label: 'Decor & Florals', color: '#8B5CF6', bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-200' },
  attire: { label: 'Jewelry & Attire', color: '#EC4899', bgColor: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-200' },
  photo: { label: 'Photography & video', color: '#3B82F6', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
  invites: { label: 'Gifts & Invitations', color: '#10B981', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-200' },
  other: { label: 'Other Ceremonies', color: '#6B7280', bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' }
};

const DEFAULT_CATEGORIES = [
  { id: 'venue', share: 40, label: 'Venue & Stays' },
  { id: 'catering', share: 25, label: 'Food & Catering' },
  { id: 'decor', share: 15, label: 'Decor & Florals' },
  { id: 'attire', share: 10, label: 'Jewelry & Attire' },
  { id: 'photo', share: 5, label: 'Photography & video' },
  { id: 'invites', share: 3, label: 'Gifts & Invitations' },
  { id: 'other', share: 2, label: 'Other Ceremonies' }
];

const PRESET_MANUAL_EXPENSES = [
  {
    id: 'man-1',
    title: 'Groom Sherwani & Bride Saree Couture',
    category: 'attire',
    amount: 85000,
    date: '2026-05-15',
    status: 'paid',
    notes: 'Premium silk and handmade gold embroidery. Verified fittings.',
    isManual: true
  },
  {
    id: 'man-2',
    title: 'Custom Celestial Astrogilded Cards',
    category: 'invites',
    amount: 25000,
    date: '2026-05-20',
    status: 'paid',
    notes: 'astrological signs matched on premium rice-paper inserts.',
    isManual: true
  },
  {
    id: 'man-3',
    title: 'Traditional Puja priest and Mandap Fire alignment',
    category: 'other',
    amount: 15000,
    date: '2026-06-03',
    status: 'pending',
    notes: 'Reserved best pundit from local temple cluster.',
    isManual: true
  }
];

export default function Budget() {
  const { user } = useAuth();
  
  // Budget & allocation states
  const [totalBudget, setTotalBudget] = useState(1000000); // 10 Lakhs INR default
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('1000000');
  
  // Custom shares allocated to categories (sum must ideally be 100%)
  const [shares, setShares] = useState(() => {
    const saved = localStorage.getItem('gathbandhan_budget_shares');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_CATEGORIES; }
    }
    return DEFAULT_CATEGORIES;
  });

  // Manual & platform expense states
  const [manualExpenses, setManualExpenses] = useState(() => {
    const saved = localStorage.getItem('gathbandhan_manual_expenses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return PRESET_MANUAL_EXPENSES; }
    }
    return PRESET_MANUAL_EXPENSES;
  });

  const [platformBookings, setPlatformBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form input states
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('venue');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('');
  const [newExpenseStatus, setNewExpenseStatus] = useState('pending');
  const [newExpenseNotes, setNewExpenseNotes] = useState('');

  // Editing shares helper
  const [isConfigureSharesOpen, setIsConfigureSharesOpen] = useState(false);

  // List filters
  const [activeListFilter, setActiveListFilter] = useState('all'); // all, bookings, manual, paid, outstanding, overdrawn

  // Total guest count multiplier (Optional - linked from GuestList or default)
  const [guestCount, setGuestCount] = useState(150);

  // Sync manual local changes
  useEffect(() => {
    localStorage.setItem('gathbandhan_manual_expenses', JSON.stringify(manualExpenses));
  }, [manualExpenses]);

  useEffect(() => {
    localStorage.setItem('gathbandhan_budget_shares', JSON.stringify(shares));
  }, [shares]);

  // Load cloud data: user profile (for custom total budget) and bookings
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Subscribe to User Profile budget
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.budget) {
          setTotalBudget(data.budget);
          setTempBudget(data.budget.toString());
        }
      }
    });

    // 2. Subscribe to user bookings in Firestore
    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
    const unsubBookings = onSnapshot(q, (snapshot) => {
      const bookingsList = snapshot.docs.map(doc => {
        const d = doc.data();
        // Guess category based on service title or vendor details if not explicitly present
        let bookingCat = 'venue';
        const titleLower = (d.serviceTitle || '').toLowerCase();
        if (titleLower.includes('food') || titleLower.includes('catering') || titleLower.includes('feast') || titleLower.includes('buffet') || titleLower.includes('chef')) {
          bookingCat = 'catering';
        } else if (titleLower.includes('flowers') || titleLower.includes('decor') || titleLower.includes('mandap') || titleLower.includes('theme') || titleLower.includes('lights')) {
          bookingCat = 'decor';
        } else if (titleLower.includes('photo') || titleLower.includes('video') || titleLower.includes('shoot') || titleLower.includes('cinematic')) {
          bookingCat = 'photo';
        } else if (titleLower.includes('sherwani') || titleLower.includes('saree') || titleLower.includes('jewelry') || titleLower.includes('outfit') || titleLower.includes('makeup') || titleLower.includes('wear')) {
          bookingCat = 'attire';
        } else if (titleLower.includes('cards') || titleLower.includes('invites') || titleLower.includes('gift') || titleLower.includes('boxes')) {
          bookingCat = 'invites';
        } else if (titleLower.includes('pundit') || titleLower.includes('pandit') || titleLower.includes('music') || titleLower.includes('sangeet')) {
          bookingCat = 'other';
        }

        return {
          id: doc.id,
          title: d.serviceTitle,
          amount: Number(d.price || d.totalAmount || 0),
          category: bookingCat,
          date: d.date || '2026-05-20',
          status: d.status || 'pending',
          notes: `Platform booking through vendor "${d.vendorName || 'Selected Vendor'}"`,
          isManual: false
        };
      });

      setPlatformBookings(bookingsList);
      setLoading(false);
    });

    // 3. Try fetching live guest count to make the cost multiplier truly dynamic!
    const qGuests = query(collection(db, 'guests'), where('userId', '==', user.uid));
    const unsubGuests = onSnapshot(qGuests, (snapshot) => {
      if (!snapshot.empty) {
        setGuestCount(snapshot.size);
      }
    });

    return () => {
      unsubProfile();
      unsubBookings();
      unsubGuests();
    };
  }, [user]);

  // Combine booking expenses with manual logs
  const allExpenses = [
    ...platformBookings,
    ...manualExpenses
  ];

  // Calculations
  const totalSpent = allExpenses
    .filter(exp => exp.status !== 'cancelled')
    .reduce((acc, exp) => acc + exp.amount, 0);

  const remainingBudget = totalBudget - totalSpent;
  const utilizedPercent = Math.min(totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0, 500);

  // Grouped spent by category
  const categorySpentMap = {};
  DEFAULT_CATEGORIES.forEach(cat => {
    categorySpentMap[cat.id] = 0;
  });
  allExpenses
    .filter(exp => exp.status !== 'cancelled')
    .forEach(exp => {
      categorySpentMap[exp.category] = (categorySpentMap[exp.category] || 0) + exp.amount;
    });

  // Calculate totals for Recharts Pie Chart
  const pieData = Object.entries(categorySpentMap)
    .map(([catId, spentVal]) => {
      const meta = CATEGORY_META[catId] || CATEGORY_META.other;
      return {
        name: meta.label,
        value: spentVal,
        color: meta.color,
        id: catId
      };
    })
    .filter(item => item.value > 0);

  // If no items have any expenses, populate a dummy "Available Allocation"
  const finalPieData = pieData.length > 0 
    ? pieData 
    : [{ name: 'Untouched Budget', value: totalBudget, color: '#F1F5F9' }];

  // Calculate comparative bar charts (Budget Allocation vs Actual Spent)
  const barChartData = shares.map(cat => {
    const allocated = Math.round((cat.share / 100) * totalBudget);
    const spent = categorySpentMap[cat.id] || 0;
    const meta = CATEGORY_META[cat.id] || CATEGORY_META.other;
    return {
      categoryName: meta.label,
      Allocated: allocated,
      Spent: spent,
      id: cat.id
    };
  });

  // Save budget handler
  const handleSaveBudget = async () => {
    const val = Number(tempBudget);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid numeric budget amount.');
      return;
    }

    setTotalBudget(val);
    setIsEditingBudget(false);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { budget: val }, { merge: true });
        toast.success(`Wedding budget synchronized in cloud: ${formatCurrency(val)}`);
      } catch (err) {
        console.error('Firestore save failed:', err);
        toast.success(`Budget updated offline: ${formatCurrency(val)}`);
      }
    } else {
      toast.success(`Budget updated offline: ${formatCurrency(val)}`);
    }
  };

  // Category shares percentage update
  const handleShareChange = (id, newShare) => {
    const updated = shares.map(item => {
      if (item.id === id) {
        return { ...item, share: Math.max(0, Number(newShare)) };
      }
      return item;
    });
    setShares(updated);
  };

  // Save category allocations and verify sum is 100%
  const handleSaveShares = () => {
    const sum = shares.reduce((acc, curr) => acc + curr.share, 0);
    if (sum !== 100) {
      toast.error(`Category allocations must sum up to exactly 100% (Current sum is ${sum}%). Please refine.`, { duration: 4000 });
      return;
    }
    setIsConfigureSharesOpen(false);
    toast.success('Celestial allocations validated & mapped!', { icon: '📐' });
  };

  // Add custom manual expense form handler
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amountVal = Number(newExpenseAmount);
    if (!newExpenseTitle.trim()) {
      toast.error('Please enter an expense title.');
      return;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    const newExp = {
      id: `man-${Date.now()}`,
      title: newExpenseTitle,
      category: newExpenseCategory,
      amount: amountVal,
      date: newExpenseDate || new Date().toISOString().split('T')[0],
      status: newExpenseStatus,
      notes: newExpenseNotes,
      isManual: true
    };

    setManualExpenses(prev => [newExp, ...prev]);
    toast.success(`Logged "${newExp.title}" successfully!`, { icon: '✍️' });
    
    // Clear inputs
    setNewExpenseTitle('');
    setNewExpenseAmount('');
    setNewExpenseNotes('');
  };

  const handleDeleteManualExpense = (id) => {
    setManualExpenses(prev => prev.filter(exp => exp.id !== id));
    toast.success('Expense item discarded.');
  };

  const toggleExpenseStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    setManualExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        return { ...exp, status: nextStatus };
      }
      return exp;
    }));
    toast.success(`Payment status toggled to: ${nextStatus.toUpperCase()}`);
  };

  // Filtering expenses list
  const filteredList = allExpenses.filter(exp => {
    if (activeListFilter === 'all') return true;
    if (activeListFilter === 'bookings') return !exp.isManual;
    if (activeListFilter === 'manual') return exp.isManual;
    if (activeListFilter === 'paid') return exp.status === 'confirmed' || exp.status === 'paid';
    if (activeListFilter === 'outstanding') return exp.status === 'pending' || exp.status === 'unpaid';
    if (activeListFilter === 'overdrawn') {
      const allocated = (shares.find(s => s.id === exp.category)?.share / 100) * totalBudget;
      const spentOnCat = categorySpentMap[exp.category] || 0;
      return spentOnCat > allocated;
    }
    return true;
  });

  // Calculate intelligent advice / warnings
  const warnings = [];
  shares.forEach(sc => {
    const limit = (sc.share / 100) * totalBudget;
    const itemSpent = categorySpentMap[sc.id] || 0;
    if (itemSpent > limit) {
      warnings.push({
        id: sc.id,
        category: CATEGORY_META[sc.id]?.label,
        overdraft: itemSpent - limit,
        label: `ALERT: Overdraft in ${CATEGORY_META[sc.id]?.label} by +${formatCurrency(itemSpent - limit)}!`
      });
    }
  });

  // Astrological wedding expense tip
  const getCelestialTip = () => {
    if (utilizedPercent > 100) {
      return "Astrological Warning: Planetary cost overheads detected! Consider shifting some custom decorations or invitations to pre-wedding online greetings. This is spiritually pure and saves precious liquid cash.";
    }
    if (categorySpentMap.venue > (0.45 * totalBudget)) {
      return "Astrologer advice: Your Venue holds more than 45% of total budget. Ensure to request multi-milestone deposit windows to align with your monthly auspicious income days.";
    }
    return "Celestial outlook: Finances are beautifully balanced. The mercury alignment indicates stable transitions for direct catering deposits this week.";
  };

  // CSV Export utility
  const exportToCSV = () => {
    const headers = ['Title', 'Category', 'Source', 'Date', 'Status', 'Amount (INR)', 'Notes'];
    const rows = allExpenses.map(exp => [
      exp.title,
      CATEGORY_META[exp.category]?.label || exp.category,
      exp.isManual ? 'Manual Log' : 'Platform Booking',
      exp.date,
      exp.status.toUpperCase(),
      exp.amount,
      exp.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gathbandhan_Wedding_Budget_Details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Budget spreadsheet exported successfully!');
  };

  return (
    <div className="pt-32 pb-24 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8" id="budget-expense-dashboard">
      
      {/* Visual Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 mb-12">
        <div>
          <span className="px-3.5 py-1 bg-pink-50 text-pink-700 text-[10px] font-black uppercase tracking-[0.25em] rounded-full border border-pink-200 inline-flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-pink-500" />
            Vedic Wedding & Finance Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-990 tracking-tighter uppercase font-serif italic mt-3.5">
            Celestial Wedding Budget Ledger
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 block">
            Monitor real-time platform bookings, allocate category limits, and visualize complete ceremonial expenses
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 md:mt-0">
          <button 
            onClick={() => setIsConfigureSharesOpen(true)}
            className="px-5 py-3 rounded-2xl border border-gray-200 hover:border-pink-500 duration-150 text-[10px] bg-white font-black uppercase tracking-widest text-gray-700 hover:text-pink-600 flex items-center gap-1.5 shadow-sm"
          >
            <Landmark className="w-4 h-4" /> Setup Allocations
          </button>
          <button 
            onClick={exportToCSV}
            className="px-5 py-3 rounded-2xl bg-gray-900 hover:bg-[#e22727] duration-150 text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 shadow-md shadow-gray-200"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Spreadsheet
          </button>
        </div>
      </div>

      {/* Astro / Celestial financial advice banner */}
      <div className="bg-gradient-to-r from-pink-50/70 to-amber-50/70 p-5 rounded-3xl border border-pink-100 mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-2xl border border-pink-200/50 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[8px] bg-pink-100 text-pink-800 font-black tracking-widest px-2 py-0.5 rounded-full uppercase">Shubh Budget Guna ⭐</span>
          <p className="text-xs text-slate-700 font-semibold mt-1 leading-relaxed md:pr-4">
            {getCelestialTip()}
          </p>
        </div>
      </div>

      {/* THREE CORE METRICS CARDS (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        
        {/* Metric 1: Total budget & Set Trigger */}
        <div className="bg-gray-950 text-white rounded-[3rem] p-8 md:p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-44 h-44 bg-pink-600 rounded-full translate-x-12 -translate-y-20 blur-[80px] opacity-40" />
          
          <div className="relative z-10">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-[0.2em]">Declared Budget</span>
            <div className="mt-4 flex items-center group">
              {isEditingBudget ? (
                <div className="flex items-center space-x-2 w-full">
                  <span className="text-2xl font-bold">₹</span>
                  <input
                    type="number"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    className="w-full bg-white/10 text-white font-black text-2xl px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none focus:border-pink-500"
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveBudget}
                    className="p-2 bg-pink-600 rounded-xl hover:bg-pink-700 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setTempBudget(totalBudget.toString());
                      setIsEditingBudget(false);
                    }}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white truncate">
                    {formatCurrency(totalBudget)}
                  </p>
                  <button 
                    onClick={() => setIsEditingBudget(true)}
                    className="ml-4 p-2.5 bg-white/5 rounded-xl text-[10px] font-black uppercase opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
                    title="Change wedding budget capacity"
                  >
                    <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Edit
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Dynamic Allocator Cap</span>
            <span className="text-pink-400">INR Standard (₹)</span>
          </div>
        </div>

        {/* Metric 2: Total spending & percentage utilized */}
        <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-gray-150 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Total Spending</span>
              <span className={cn(
                "px-2.5 py-0.5 text-[8px] font-black rounded-md uppercase tracking-widest",
                utilizedPercent > 100 ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              )}>
                {utilizedPercent}% Used
              </span>
            </div>
            
            <p className="text-3xl md:text-4xl font-black font-mono tracking-tight text-gray-900 mt-4">
              {formatCurrency(totalSpent)}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(utilizedPercent, 100)}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  utilizedPercent > 100 ? "bg-[#e22727]" : utilizedPercent > 85 ? "bg-amber-500" : "bg-[#E50478]"
                )}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              <span>{allExpenses.length} Expense logs active</span>
              <span>Target: {utilizedPercent}%</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Remainder or budget overdrawn alert */}
        <div className={cn(
          "rounded-[3rem] p-8 md:p-10 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px] transition-colors duration-200 border",
          remainingBudget >= 0 
            ? "bg-white border-gray-150" 
            : "bg-red-50/50 border-red-200"
        )}>
          {remainingBudget < 0 && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full translate-x-12 -translate-y-12 blur-2xl" />
          )}
          
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
              {remainingBudget >= 0 ? "Remaining Balance" : "Budget Deficit Alert ⚠️"}
            </span>
            
            <p className={cn(
              "text-3xl md:text-4xl font-black font-mono tracking-tight mt-4",
              remainingBudget >= 0 ? "text-emerald-600" : "text-red-500"
            )}>
              {formatCurrency(Math.abs(remainingBudget))}
            </p>
          </div>

          <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pt-4 border-t border-gray-100">
            {remainingBudget >= 0 
              ? "You are safely inside your budget allowance"
              : "Warning: Please scale down custom tasks or find budget vendors"
            }
          </p>
        </div>

      </div>

      {/* CORE DUAL CHARTING & ALLOCATION BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-stretch">
        
        {/* Chart 1: Category Breakdown Pie (Left: 5 columns on large screen) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 shadow-sm p-6 md:p-8 rounded-[2.5rem] flex flex-col justify-between">
          <div>
            <span className="px-3.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border border-amber-200 inline-flex items-center gap-1 mb-4">
              <ChartIcon className="w-3.5 h-3.5 text-amber-500" />
              Category share metrics
            </span>
            <h3 className="text-xl font-black text-gray-950 font-serif uppercase tracking-tight">
              Ceremonial Cost Breakdown
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
              Visual proportion of weddings fund shared dynamically by purpose
            </p>
          </div>

          {/* Recharts Pie container */}
          <div className="h-64 w-full my-6 flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-center">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Untouched budget</p>
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center mx-auto text-gray-300 font-bold">100%</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {finalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '1.25rem', border: '1px solid #e2e8f0', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Live Legends list with spent value */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            {DEFAULT_CATEGORIES.map(cat => {
              const spent = categorySpentMap[cat.id] || 0;
              const meta = CATEGORY_META[cat.id];
              return (
                <div key={cat.id} className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider mt-0.5 truncate">{meta.label}</span>
                    <span className="text-[10px] font-black font-mono text-gray-900">{formatCurrency(spent)}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Chart 2: Allocated vs Spent Bar (Right: 7 columns on large screen) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 shadow-sm p-6 md:p-8 rounded-[2.5rem] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="px-3.5 py-1 bg-purple-50 text-purple-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border border-purple-200 inline-flex items-center gap-1 mb-3.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                Target Alignment
              </span>
              <h3 className="text-xl font-black text-gray-950 font-serif uppercase tracking-tight">
                Allocated vs Actual Spent
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 block">
                Compare your target budget shares to actual booked vendors
              </p>
            </div>

            {/* Micro Legende indicator */}
            <div className="flex items-center space-x-4 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                <span className="w-2.5 h-2.5 rounded bg-gray-300 inline-block" /> Limit
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                <span className="w-2.5 h-2.5 rounded bg-[#E50478] inline-block" /> Spent
              </div>
            </div>
          </div>

          {/* Bar chart canvas */}
          <div className="h-64 sm:h-72 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="categoryName" 
                  tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tickFormatter={(val) => `₹${val/1000}k`}
                  tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '1rem', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="Allocated" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Spent" fill="#E50478" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Cost Per Guest metrics */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-150 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 shadow-sm">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-[7px] text-gray-400 uppercase font-black tracking-widest block leading-none">Standard Guest Divider</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-white border border-gray-200 p-1 text-xs font-bold text-gray-800 rounded-lg text-center"
                    min="1"
                  />
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Guests</span>
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col justify-center sm:border-l sm:border-gray-200 sm:pl-6">
              <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest leading-none">Avg Cost Per Guest</span>
              <p className="text-xl font-black font-mono text-gray-900 mt-1">
                {formatCurrency(totalSpent / guestCount)}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED EXPENSE INPUT & LIST LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Add New Expense Form (4 Columns) */}
        <div className="lg:col-span-4 bg-white border border-gray-150 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
          <h3 className="text-lg font-black font-serif uppercase tracking-tight text-gray-900 flex items-center gap-2 mb-6">
            <Plus className="w-5 h-5 text-[#e22727]" />
            Log Custom Expense
          </h3>

          <form onSubmit={handleAddExpense} className="space-y-4">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Item / Service Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Astrogild Mandap extra, Diamond ring..."
                value={newExpenseTitle}
                onChange={(e) => setNewExpenseTitle(e.target.value)}
                className="w-full text-xs font-semibold text-gray-805 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none"
              />
            </div>

            {/* Category & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Category *
                </label>
                <select
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white outline-none"
                >
                  {Object.entries(CATEGORY_META).map(([id, meta]) => (
                    <option key={id} value={id}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Price in ₹"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-805 bg-gray-50 border border-gray-200 rounded-xl p-3 placeholder:text-gray-400 focus:bg-white outline-none"
                  min="1"
                />
              </div>
            </div>

            {/* Date & Payment Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Bill Date
                </label>
                <input
                  type="date"
                  value={newExpenseDate}
                  onChange={(e) => setNewExpenseDate(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-705 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Status
                </label>
                <select
                  value={newExpenseStatus}
                  onChange={(e) => setNewExpenseStatus(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white outline-none"
                >
                  <option value="pending">Pending Payment ⏳</option>
                  <option value="paid">Confirm Paid ✅</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Planning Notes / Contact Code
              </label>
              <textarea
                rows={2}
                placeholder="Vendor phone, invoice number, payment mode details..."
                value={newExpenseNotes}
                onChange={(e) => setNewExpenseNotes(e.target.value)}
                className="w-full text-xs font-semibold text-gray-805 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#e22727] hover:bg-[#c11c1c] text-white p-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-150 active:scale-97 shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log Manual Expense
            </button>
          </form>
        </div>

        {/* Right: Detailed Expenses List Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-[2.5rem] shadow-sm overflow-hidden">
          
          {/* Header & filters */}
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black font-serif uppercase tracking-tight text-gray-990">
                Detailed Spend Register
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 text-slate-400">
                Manage and audit all platform service bills and manual items
              </p>
            </div>

            {/* Alert on critical overspending in specific Category */}
            {warnings.length > 0 && (
              <div className="bg-red-50 text-red-700 text-[10px] p-2.5 rounded-xl border border-red-200 flex items-center gap-1.5 font-bold">
                <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                <span>Exceeded category targets!</span>
              </div>
            )}
          </div>

          {/* Quick Filters Tab lists */}
          <div className="px-6 md:px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Spent' },
              { id: 'bookings', label: 'Platform Bookings 💍' },
              { id: 'manual', label: 'Manual Entries ✏️' },
              { id: 'paid', label: 'Fully Paid ✅' },
              { id: 'outstanding', label: 'Pending Payment ⏳' },
              { id: 'overdrawn', label: 'Target Exceeded ⚠️' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveListFilter(filter.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border duration-100 cursor-pointer",
                  activeListFilter === filter.id 
                    ? "bg-gray-900 border-gray-900 text-white" 
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Actual items list */}
          {filteredList.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <HelpCircle className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest">No matching transactions</p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                Try logging manual actions on the left sidebar or explore vendors to auto-populate bookings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/40 text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4.5 px-6">Expense Detail</th>
                    <th className="py-4.5 px-4">Category</th>
                    <th className="py-4.5 px-4">Origin / Source</th>
                    <th className="py-4.5 px-4">Status</th>
                    <th className="py-4.5 px-4 text-right">Amount (₹)</th>
                    <th className="py-4.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((exp) => {
                    const meta = CATEGORY_META[exp.category] || CATEGORY_META.other;
                    const isPaid = exp.status === 'confirmed' || exp.status === 'paid';
                    
                    return (
                      <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors text-xs items-center group">
                        
                        {/* Title and notes details */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="font-extrabold text-gray-905 uppercase tracking-wide truncate">
                            {exp.title}
                          </p>
                          {exp.notes && (
                            <p className="text-[9px] text-gray-400 mt-1 italic select-text truncate">
                              {exp.notes}
                            </p>
                          )}
                        </td>

                        {/* Category tag */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
                            meta.bgColor, meta.textColor
                          )}>
                            {meta.label}
                          </span>
                        </td>

                        {/* Source origin badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                            exp.isManual 
                              ? "bg-white text-gray-500 border-gray-150" 
                              : "bg-pink-50 text-pink-700 border-pink-100"
                          )}>
                            {exp.isManual ? 'Manual Input' : 'Bookings API'}
                          </span>
                        </td>

                        {/* Paid status check */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {exp.isManual ? (
                            <button
                              onClick={() => toggleExpenseStatus(exp.id, exp.status)}
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer flex items-center gap-1 hover:brightness-95",
                                isPaid ? "bg-green-50 text-green-700 font-black" : "bg-orange-50 text-orange-700 font-semibold"
                              )}
                              title="Click to toggle payment status"
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full inline-block", isPaid ? "bg-green-600" : "bg-orange-600")} />
                              {isPaid ? 'Paid' : 'Pending'}
                            </button>
                          ) : (
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1",
                              isPaid ? "text-green-700 font-black" : "text-orange-700 font-semibold"
                            )}>
                              <span className={cn("w-1.5 h-1.5 rounded-full inline-block", isPaid ? "bg-green-600" : "bg-orange-500")} />
                              {isPaid ? 'Paid' : 'Deposit Out'}
                            </span>
                          )}
                        </td>

                        {/* Cost amount */}
                        <td className="py-4 px-4 text-right whitespace-nowrap font-bold font-mono text-gray-900">
                          {formatCurrency(exp.amount)}
                        </td>

                        {/* Actions discard */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          {exp.isManual ? (
                            <button
                              onClick={() => handleDeleteManualExpense(exp.id)}
                              className="w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors mx-auto"
                              title="Delete logged transaction item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-300 select-none">Protected</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* DETAILED SETUP CONFIGURE METRIC ALLOCATIONS MODAL */}
      <AnimatePresence>
        {isConfigureSharesOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl border border-gray-100"
            >
              
              <button 
                onClick={() => setIsConfigureSharesOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[9px] bg-pink-100 text-pink-700 font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">Set Allocation caps</span>
                <h3 className="text-2xl font-black text-gray-900 font-serif uppercase tracking-tight mt-2">Configure Category Shares</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Adjust target percentage breakdown of your total budget (Must sum to 100%)
                </p>
              </div>

              {/* Share List configuration sliders */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                {shares.map(cat => {
                  const meta = CATEGORY_META[cat.id] || CATEGORY_META.other;
                  const targetCash = Math.round((cat.share / 100) * totalBudget);
                  
                  return (
                    <div key={cat.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex items-center justify-between gap-6">
                      <div className="flex items-center space-x-3 w-1/3">
                        <span className="w-3 h-3 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: meta.color }} />
                        <span className="text-xs font-black text-gray-700 uppercase tracking-wide">{meta.label}</span>
                      </div>

                      {/* Slider Input range */}
                      <div className="flex-1 flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cat.share}
                          onChange={(e) => handleShareChange(cat.id, e.target.value)}
                          className="w-full accent-[#E50478] cursor-pointer"
                        />
                        <span className="w-10 text-right text-xs font-black text-gray-800 font-mono">{cat.share}%</span>
                      </div>

                      {/* Cash limit readout */}
                      <div className="w-24 text-right">
                        <span className="block text-[8px] text-gray-404 font-black uppercase tracking-wider">Cap Limit</span>
                        <span className="text-xs font-extrabold text-[#E50478]">{formatCurrency(targetCash)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual validator sum bottom footer */}
              <div className="pt-6 border-t border-gray-100 mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Running Percentage Sum:</span>
                  <span className={cn(
                    "font-extrabold text-sm px-2.5 py-0.5 rounded-full font-mono text-center inline-block",
                    shares.reduce((a,c) => a+c.share,0) === 100 ? "bg-green-100 text-green-700 font-black" : "bg-red-100 text-red-600 font-black"
                  )}>
                    {shares.reduce((a,c) => a+c.share,0)}%
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShares(DEFAULT_CATEGORIES)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-slate-500 font-bold hover:bg-slate-50 text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={handleSaveShares}
                    className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-pink-600 font-black text-white text-[10px] uppercase tracking-widest transition-colors shadow-md cursor-pointer"
                  >
                    Validate & Confirm
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
