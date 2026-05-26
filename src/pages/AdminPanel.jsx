import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { Shield, X, TrendingUp, Users, Clock, MapPin, CheckCircle2, FileDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { cn, formatCurrency } from '../lib/utils';
import { DEMO_SERVICES, CATEGORIES } from '../constants';
import toast from 'react-hot-toast';
import { setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminPanel() {
  const { role, impersonate } = useAuth();
  const [services, setServices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [filter, setFilter] = useState('pending');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [approvalModal, setApprovalModal] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleImpersonate = async (targetUser) => {
    if (!window.confirm(`Presentation Mode: Switch to ${targetUser.displayName || 'Vendor'}'s view?`)) return;
    
    const toastId = toast.loading(`Switching identities...`);
    try {
      impersonate(targetUser);
      toast.success('Switched successfully! You now see the platform as this user.', { id: toastId });
      
      // Navigate to the correct context
      if (targetUser.role === 'vendor') {
        window.location.href = '/vendor-dashboard';
      } else {
        window.location.href = '/services';
      }
    } catch (err) {
      toast.error('Failed to switch');
    }
  };

  useEffect(() => {
    if (role !== 'admin') return;

    // Services Listener
    const servicesQ = query(collection(db, 'services'));
    const unsubServices = onSnapshot(servicesQ, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, 'list', 'services'));

    // Vendors & User Counts
    const unsubVendors = onSnapshot(query(collection(db, 'users'), where('role', '==', 'vendor')), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Vendors fetch error:", error);
      // We don't throw here to avoid crashing the whole admin UI, just log
    });

    const fetchCounts = async () => {
      try {
        const usersSnapshot = await getCountFromServer(collection(db, 'users'));
        setTotalUsersCount(usersSnapshot.data().count);
      } catch (err) {
        console.error("Count fetch error:", err);
      }
    };

    fetchCounts();
    return () => {
      unsubServices();
      unsubVendors();
    };
  }, [role]);

  const seedData = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    const t = toast.loading('Seeding system data...');
    try {
      // Seed Vendors first
      const vendorIds = [...new Set(DEMO_SERVICES.map(s => s.vendorId))];
      for (const vId of vendorIds) {
        const demoService = DEMO_SERVICES.find(s => s.vendorId === vId);
        await setDoc(doc(db, 'users', vId), {
          uid: vId,
          displayName: demoService.vendorName,
          email: `${vId}@example.com`,
          role: 'vendor',
          verified: true,
          createdAt: serverTimestamp()
        });
      }

      // Seed Services
      for (const s of DEMO_SERVICES) {
        await setDoc(doc(db, 'services', s.id), {
          ...s,
          createdAt: serverTimestamp()
        });
      }
      
      toast.success('System data seeded successfully!', { id: t });
    } catch (error) {
      console.error("Seeding error:", error);
      toast.error('Failed to seed data', { id: t });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDoc(doc(db, 'services', id), { status });
      toast.success(`Service ${status} updated`);
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const toggleVendorVerification = async (vendorId, current) => {
    try {
      await updateDoc(doc(db, 'users', vendorId), { verified: !current });
      setVendors(prev => prev.map(v => v.uid === vendorId ? { ...v, verified: !current } : v));
      toast.success('Vendor verification updated');
    } catch (error) {
      toast.error('Failed to update vendor');
    }
  };

  if (role !== 'admin') return <div className="pt-32 text-center text-red-500 font-black uppercase tracking-widest">Access Denied</div>;

  const filteredServices = services.filter(s => filter === 'all' || s.status === filter);
  const filteredVendors = vendors.filter(v => 
    vendorFilter === 'all' || 
    (vendorFilter === 'pending' && !v.verified) || 
    (vendorFilter === 'verified' && v.verified)
  );
  
  const getCategoryData = () => {
    const cats = CATEGORIES.filter(c => c !== 'All');
    return cats.map(cat => ({
      name: cat,
      value: services.filter(s => s.category.toLowerCase() === cat.toLowerCase()).length
    })).filter(d => d.value > 0);
  };

  const getApprovalRate = () => {
    const counts = { approved: 0, pending: 0, rejected: 0 };
    services.forEach(s => {
      if (counts[s.status] !== undefined) counts[s.status]++;
    });
    return [
      { name: 'Approved', value: counts.approved, color: '#10B981' },
      { name: 'Pending', value: counts.pending, color: '#F59E0B' },
      { name: 'Rejected', value: counts.rejected, color: '#EF4444' }
    ].filter(d => d.value > 0);
  };

  const stats = [
    { 
      label: 'Platform Revenue', 
      value: formatCurrency(services.filter(s => s.status === 'approved').reduce((acc, s) => acc + s.price, 0)), 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Verified Vendors', 
      value: vendors.filter(v => v.verified).length, 
      icon: CheckCircle2, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Total Registered', 
      value: vendors.length, 
      icon: Users, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50' 
    },
    { 
      label: 'Pending Approvals', 
      value: services.filter(s => s.status === 'pending').length + vendors.filter(v => !v.verified).length, 
      icon: Clock, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
  ];

  return (
    <div className="pt-36 pb-20 max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
             <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-2">Admin Dashboard</h1>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Administration & Governance</p>
          </div>
          <Link 
            to="/report" 
            className="flex items-center space-x-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-pink-600 hover:bg-pink-50 transition-all shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Project Report</span>
          </Link>
        </div>

        <div className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
          {vendors.length === 0 && (
            <button
              onClick={seedData}
              disabled={isSeeding}
              className="mr-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-pink-600 text-white shadow-lg hover:bg-pink-700 transition-all disabled:opacity-50"
            >
              {isSeeding ? 'Seeding...' : 'Seed System Data'}
            </button>
          )}
          <button
            onClick={() => setActiveTab('services')}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'services' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"
            )}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'vendors' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-900"
            )}
          >
            Vendors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'services' ? (
          <motion.div
            key="services"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-12"
          >
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                   <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-8 italic">Category Distribution</h3>
                   <div className="h-64 w-full relative min-h-[256px]">
                      {isChartReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
                            <BarChart data={getCategoryData()}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} />
                                <Bar dataKey="value" fill="#E50478" radius={[8, 8, 8, 8]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                      )}
                   </div>
                </div>
                <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Approval Health</h3>
                    <div className="h-48 w-full relative min-h-[192px]">
                        {isChartReady && (
                            <ResponsiveContainer width="100%" height="100%" minHeight={150} minWidth={0}>
                                <PieChart>
                                    <Pie data={getApprovalRate()} innerRadius={50} outerRadius={70} paddingAngle={10} dataKey="value">
                                        {getApprovalRate().map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-6 flex gap-4">
                       <div className="flex items-center text-[9px] font-black uppercase text-green-600"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"/> Approved</div>
                       <div className="flex items-center text-[9px] font-black uppercase text-orange-600"><div className="w-2 h-2 bg-orange-500 rounded-full mr-2"/> Pending</div>
                    </div>
                </div>
             </div>

             <div className="flex justify-between items-center px-4">
                <h3 className="text-xl font-bold text-gray-900 italic">Service Requests</h3>
                <div className="flex bg-gray-50 p-1 rounded-xl">
                    <button onClick={() => setFilter('pending')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'pending' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-400")}>Pending</button>
                    <button onClick={() => setFilter('approved')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'approved' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-400")}>Approved</button>
                    <button onClick={() => setFilter('all')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-400")}>All</button>
                </div>
             </div>

             <div className="grid gap-6">
                {filteredServices.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-8 group">
                     <div className="flex items-center space-x-6 text-left">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl border border-gray-50 group-hover:scale-110 transition-transform">
                          {s.category === 'Pandit' ? '🪔' : s.category === 'DJ' ? '🎧' : s.category === 'Venue' ? '🏰' : '✨'}
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase group-hover:text-pink-600 transition-colors leading-none mb-2">{s.title}</h4>
                           <div className="flex flex-wrap gap-4 items-center">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center"><MapPin className="w-3 h-3 mr-2" /> {s.location}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center"><Users className="w-3 h-3 mr-2" /> {s.vendorName}</span>
                              <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase", s.status === 'approved' ? "bg-green-50 text-green-600" : s.status === 'pending' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600")}>{s.status}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <p className="text-xl font-black text-gray-900 mr-4">{formatCurrency(s.price)}</p>
                        <button onClick={() => setApprovalModal(s)} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-100">Review Request</button>
                     </div>
                  </div>
                ))}
                {filteredServices.length === 0 && (
                  <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm italic">No requests matching criteria</p>
                  </div>
                )}
             </div>
          </motion.div>
        ) : (
          <motion.div
            key="vendors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             <div className="flex justify-end mb-4">
                <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    <button onClick={() => setVendorFilter('all')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", vendorFilter === 'all' ? "bg-gray-900 text-white shadow-sm" : "text-gray-400")}>All Vendors</button>
                    <button onClick={() => setVendorFilter('pending')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", vendorFilter === 'pending' ? "bg-gray-900 text-white shadow-sm" : "text-gray-400")}>Unverified</button>
                    <button onClick={() => setVendorFilter('verified')} className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", vendorFilter === 'verified' ? "bg-gray-900 text-white shadow-sm" : "text-gray-400")}>Verified</button>
                </div>
             </div>

             <div className="bg-white rounded-[3.5rem] p-12 border border-gray-50 shadow-sm overflow-hidden">
               <div className="overflow-x-auto text-left">
                 <table className="w-full">
                   <thead>
                      <tr className="border-b border-gray-50 pb-6 uppercase">
                        <th className="pb-8 text-[10px] font-black text-gray-400 tracking-widest">Vendor Profile</th>
                        <th className="pb-8 text-[10px] font-black text-gray-400 tracking-widest">Contact</th>
                        <th className="pb-8 text-[10px] font-black text-gray-400 tracking-widest text-center">Identity Status</th>
                        <th className="pb-8 text-[10px] font-black text-gray-400 tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredVendors.map(v => (
                        <tr key={v.uid} className="group">
                          <td className="py-8">
                             <div className="flex items-center space-x-6">
                                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center font-black text-pink-600 italic text-xl border border-pink-100">
                                  {v.displayName ? v.displayName[0] : 'V'}
                                </div>
                                <div>
                                   <p className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors uppercase tracking-tight">{v.displayName}</p>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {v.uid.slice(0, 8)}...</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-8 font-medium text-sm text-gray-600">{v.email}</td>
                          <td className="py-8 text-center">
                             {v.verified ? (
                               <div className="inline-flex items-center px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-full">
                                 <CheckCircle2 className="w-3 h-3 mr-2" /> Verified
                               </div>
                             ) : (
                               <div className="inline-flex items-center px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-full">
                                 <Clock className="w-3 h-3 mr-2" /> Pending
                               </div>
                             )}
                          </td>
                          <td className="py-8 text-right">
                             <div className="flex items-center justify-end space-x-2">
                               <button 
                                 onClick={() => handleImpersonate(v)}
                                 className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all border border-pink-100"
                               >
                                 Login As
                               </button>
                               <button onClick={() => toggleVendorVerification(v.uid, !!v.verified)} className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", v.verified ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-600 text-white hover:bg-green-700")}>
                                 {v.verified ? 'Revoke Access' : 'Authorize Vendor'}
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {filteredVendors.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest italic">No vendors found in this category</td>
                        </tr>
                      )}
                   </tbody>
                 </table>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {approvalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full translate-x-16 -translate-y-16 blur-3xl opacity-40" />
               <button onClick={() => setApprovalModal(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900"><X className="w-8 h-8" /></button>
               
               <div className="mb-12">
                  <span className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block italic">Review Request</span>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">{approvalModal.title}</h2>
                  <p className="text-sm text-gray-400 font-medium mt-2">Vendor Identity: <span className="text-gray-900 font-bold uppercase tracking-tight">{approvalModal.vendorName}</span></p>
               </div>

               <div className="grid md:grid-cols-2 gap-10 mb-12">
                  <div className="space-y-6">
                     <div className="p-6 bg-gray-50 rounded-2xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Category & Price</p>
                        <p className="text-lg font-bold text-gray-900">{approvalModal.category} <span className="text-pink-600 font-black ml-4">{formatCurrency(approvalModal.price)}</span></p>
                     </div>
                     <div className="p-6 bg-gray-50 rounded-2xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Location Strategy</p>
                        <p className="text-sm font-bold text-gray-900 uppercase">{approvalModal.location}</p>
                     </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Business Pitch</p>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{approvalModal.description || 'Custom wedding service provider focused on luxury and tradition.'}"</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => { handleStatusUpdate(approvalModal.id, 'rejected'); setApprovalModal(null); }} className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">Reject</button>
                  <button 
                    onClick={async () => { 
                      await handleStatusUpdate(approvalModal.id, 'approved'); 
                      // If vendor is not verified, verify them now too
                      const v = vendors.find(ven => ven.uid === approvalModal.vendorId);
                      if (v && !v.verified) {
                        await toggleVendorVerification(v.uid, false);
                      }
                      setApprovalModal(null); 
                    }} 
                    className="flex-[2] bg-gray-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-pink-600 transition-all"
                  >
                    Approve & Verify Vendor
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
