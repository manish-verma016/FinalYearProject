import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Plus, 
  Settings, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Package,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Trash2,
  Edit2,
  User,
  Mail,
  Phone,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AddServiceModal from '../components/AddServiceModal';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VendorDashboard() {
  const { user, profile, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.businessInfo?.phone || '',
    location: profile?.businessInfo?.location || '',
    about: profile?.businessInfo?.about || '',
  });

  useEffect(() => {
    if (profile) {
      setSettingsForm({
        displayName: profile.displayName || '',
        phone: profile.businessInfo?.phone || '',
        location: profile.businessInfo?.location || '',
        about: profile.businessInfo?.about || '',
      });
    }
  }, [profile]);

  const isVerified = profile?.verified === true;

  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    if (!user) return;

    const bQuery = query(collection(db, 'bookings'), where('vendorId', '==', user.uid));
    const sQuery = query(collection(db, 'services'), where('vendorId', '==', user.uid));
    const eQuery = query(collection(db, 'enquiries'), where('vendorId', '==', user.uid));

    const unsubBookings = onSnapshot(bQuery, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(fetchedBookings);
    });

    const unsubServices = onSnapshot(sQuery, (snapshot) => {
      const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(fetchedServices);
    });

    const unsubEnquiries = onSnapshot(eQuery, (snapshot) => {
      const fetchedEnquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnquiries(fetchedEnquiries);
    });

    setLoading(false);
    return () => {
      unsubBookings();
      unsubServices();
      unsubEnquiries();
    };
  }, [user]);

  const [replyText, setReplyText] = useState({});

  const handleReply = async (enquiryId) => {
    if (!replyText[enquiryId]?.trim()) return;
    try {
      await updateDoc(doc(db, 'enquiries', enquiryId), {
        reply: replyText[enquiryId],
        status: 'responded',
        repliedAt: serverTimestamp()
      });
      toast.success('Reply sent!');
      setReplyText({ ...replyText, [enquiryId]: '' });
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleEnquiryStatus = async (enquiryId, status) => {
    try {
      await updateDoc(doc(db, 'enquiries', enquiryId), { status });
      toast.success('Enquiry updated');
    } catch (error) {
      toast.error('Failed to update enquiry');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      toast.success(`Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'}`);
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
    
    const t = toast.loading('Deleting service...');
    try {
      await deleteDoc(doc(db, 'services', serviceId));
      toast.success('Service deleted successfully', { id: t });
    } catch (error) {
      console.error('Delete error', error);
      toast.error('Failed to delete service', { id: t });
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingSettings(true);
    const t = toast.loading('Saving settings...');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: settingsForm.displayName,
        businessInfo: {
          phone: settingsForm.phone,
          location: settingsForm.location,
          about: settingsForm.about,
          updatedAt: serverTimestamp()
        }
      });
      await refreshRole();
      toast.success('Settings saved successfully', { id: t });
    } catch (error) {
       console.error('Settings save error', error);
       toast.error('Failed to save settings', { id: t });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Pending Requests', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Verified Services', value: services.filter(s => s.status === 'approved').length, icon: Zap, color: 'text-pink-500', bg: 'bg-pink-50' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex pt-32">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col fixed top-20 bottom-0 z-20">
        <div className="p-8 flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight italic">Vendor Hub</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={LayoutDashboard} 
            label="Overview" 
          />
          <NavItem 
            active={activeTab === 'bookings'} 
            onClick={() => setActiveTab('bookings')} 
            icon={Calendar} 
            label="Bookings" 
          />
          <NavItem 
            active={activeTab === 'services'} 
            onClick={() => setActiveTab('services')} 
            icon={Package} 
            label="My Services" 
          />
          <NavItem 
            active={activeTab === 'messages'} 
            onClick={() => setActiveTab('messages')} 
            icon={MessageSquare} 
            label="Messages" 
          />
          <NavItem 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={Settings} 
            label="Settings" 
          />
        </nav>

        <div className="p-8 border-t border-gray-50 space-y-4">
          <div className={cn(
            "p-6 rounded-[1.5rem] border transition-all",
            isVerified ? "bg-green-50 border-green-100" : "bg-pink-50 border-pink-100"
          )}>
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheck className={cn("w-4 h-4", isVerified ? "text-green-600" : "text-pink-600")} />
              <span className={cn("text-[9px] font-black uppercase tracking-widest", isVerified ? "text-green-600" : "text-pink-600")}>
                {isVerified ? "Verified Partner" : "Verification"}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 mb-4 leading-tight uppercase">
              {isVerified ? "Your identity is fully authorized" : "Profile currently under review"}
            </p>
            <div className="w-full bg-white/50 h-1 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: isVerified ? '100%' : '65%' }}
                 className={cn("h-full", isVerified ? "bg-green-600" : "bg-pink-600")}
               />
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-3" /> Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-80 p-12">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
           <div className="space-y-1">
             <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
                {activeTab === 'overview' ? 'Vendor Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
             </h2>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth phase • {services.length} Active Listings</p>
           </div>
           
           <div className="flex items-center space-x-4">
             {activeTab === 'services' && (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="bg-[#E50478] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all flex items-center shadow-xl shadow-pink-100"
               >
                 <Plus className="w-4 h-4 mr-2" /> Add Service
               </button>
             )}
             <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 text-xs">
                  {user.displayName?.[0]}
                </div>
                <div className="pr-4">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-none">{user.displayName}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Gold Partner</p>
                </div>
             </div>
           </div>
        </div>

        <div className="space-y-12">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <h3 className="text-4xl font-black text-gray-900 leading-none">{stat.value}</h3>
                  </motion.div>
                ))}
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-50 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">Upcoming Schedule</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next 30 Days Outook</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-[10px] font-black text-pink-500 uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform"
                    >
                      View Full Calendar <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                    <div className="space-y-4">
                      {bookings.length > 0 ? (
                        bookings.slice(0, 4).map((booking) => (
                          <div key={booking.id} className="p-6 bg-gray-50/50 rounded-[1.5rem] border border-transparent hover:border-gray-100 hover:bg-white transition-all group/item flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 font-black text-pink-600 text-[10px] italic">
                                 {new Date(booking.date).getDate()}<br/>{new Date(booking.date).toLocaleString('default', { month: 'short' })}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-gray-900 group-hover/item:text-pink-600 transition-colors uppercase tracking-tight italic">{booking.userName}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{booking.serviceTitle}</p>
                               </div>
                            </div>
                            <div className="text-right flex items-center space-x-4">
                               <div>
                                 <span className={cn(
                                   "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                   booking.status === 'confirmed' ? "bg-green-50 text-green-600" : 
                                   booking.status === 'pending' ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400"
                                 )}>
                                   {booking.status}
                                 </span>
                                 <p className="text-[10px] font-black text-gray-900 mt-2">₹{booking.totalAmount}</p>
                               </div>
                               {booking.status === 'pending' && (
                                 <div className="flex flex-col gap-2">
                                   <button 
                                     onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                     className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                     title="Approve"
                                   >
                                     <CheckCircle2 className="w-3 h-3" />
                                   </button>
                                   <button 
                                     onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                     className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                     title="Reject"
                                   >
                                     <XCircle className="w-3 h-3" />
                                   </button>
                                 </div>
                               )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                          No upcoming schedule yet
                        </div>
                      )}
                    </div>
                </div>

                {/* Growth Tips */}
                <div className="space-y-8">
                  <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Zap className="w-24 h-24" />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter mb-6 relative z-10">AI Insights</h3>
                    <div className="space-y-4 relative z-10">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                         "Couples in <span className="text-white italic">Aligarh</span> are searching for <span className="text-pink-400 italic">Vedic Chanting</span> 40% more this week. Update your service description to include this!"
                       </p>
                       <button className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                         Apply Suggestion
                       </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight italic mb-8">My Services</h3>
                    <div className="space-y-6">
                      {services.slice(0, 2).map((service) => (
                        <div key={service.id} className="group/item">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{service.title}</p>
                            <span className="text-[8px] font-black text-green-600 uppercase">Live</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1 rounded-full">
                            <div className="bg-gray-900 h-full w-[85%] rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setActiveTab('services')}
                      className="w-full mt-10 text-[10px] font-black text-pink-500 uppercase tracking-widest flex items-center justify-center hover:translate-x-1 transition-transform"
                    >
                      Manage All <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-[3rem] border border-gray-50 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client / Service</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-gray-900 group-hover:text-pink-600 transition-colors">{booking.userName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{booking.serviceTitle}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-500 font-bold">{booking.date}</p>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-gray-900">₹{booking.totalAmount}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 
                          booking.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        {booking.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:text-green-700"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-red-700"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Details</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditingService(service);
                            setIsModalOpen(true);
                          }}
                          className="p-3 bg-white text-gray-400 hover:text-pink-600 rounded-xl shadow-lg border border-gray-50 transition-all hover:scale-110"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service.id)}
                          className="p-3 bg-white text-gray-400 hover:text-red-600 rounded-xl shadow-lg border border-gray-50 transition-all hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-50 transition-colors">
                    <Package className="w-6 h-6 text-gray-400 group-hover:text-pink-600" />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-2 leading-tight group-hover:text-pink-600 transition-colors">{service.title}</h4>
                  <p className="text-2xl font-black text-gray-900 mb-6 font-mono">₹{service.price}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest ${
                      service.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {service.status}
                    </span>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {service.category}
                    </span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  setEditingService(null);
                  setIsModalOpen(true);
                }}
                className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50/30 transition-all group min-h-[300px]"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-black uppercase tracking-widest text-[10px]">Add New Service</span>
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="max-w-4xl">
                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                   <div className="flex items-center space-x-6 mb-12">
                      <div className="w-20 h-20 bg-pink-100 rounded-[2rem] flex items-center justify-center">
                         <Settings className="w-10 h-10 text-pink-600" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic">Personal Settings</h3>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update your professional profile</p>
                      </div>
                   </div>

                   <form onSubmit={handleUpdateSettings} className="space-y-10">
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Display Name</label>
                            <div className="relative">
                               <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <input 
                                 type="text"
                                 value={settingsForm.displayName}
                                 onChange={(e) => setSettingsForm({ ...settingsForm, displayName: e.target.value })}
                                 className="w-full h-16 pl-14 pr-8 bg-gray-50 rounded-[1.5rem] font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                               />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Email (Static)</label>
                            <div className="relative">
                               <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <input 
                                 disabled
                                 type="text"
                                 value={profile?.email || ''}
                                 className="w-full h-16 pl-14 pr-8 bg-gray-100 rounded-[1.5rem] font-bold text-gray-400 cursor-not-allowed outline-none"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Contact Phone</label>
                            <div className="relative">
                               <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <input 
                                 type="text"
                                 value={settingsForm.phone}
                                 onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                 placeholder="+91 00000 00000"
                                 className="w-full h-16 pl-14 pr-8 bg-gray-50 rounded-[1.5rem] font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                               />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Business Location</label>
                            <div className="relative">
                               <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <input 
                                 type="text"
                                 value={settingsForm.location}
                                 onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                                 placeholder="e.g. Aligarh, UP"
                                 className="w-full h-16 pl-14 pr-8 bg-gray-50 rounded-[1.5rem] font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">About Business</label>
                         <textarea 
                           rows={4}
                           value={settingsForm.about}
                           onChange={(e) => setSettingsForm({ ...settingsForm, about: e.target.value })}
                           placeholder="Tell us about your services and experience..."
                           className="w-full p-8 bg-gray-50 rounded-[2.5rem] font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all outline-none resize-none"
                         />
                      </div>

                      <button 
                        type="submit"
                        disabled={isSavingSettings}
                        className="w-full h-20 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-pink-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center group"
                      >
                         {isSavingSettings ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                           <>
                              <Save className="w-5 h-5 mr-3" /> Save Changes
                           </>
                         )}
                      </button>
                   </form>
                </div>
             </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-8">
               <div className="flex items-center justify-between px-4">
                  <h3 className="text-xl font-black text-gray-900 italic">Fresh Enquiries</h3>
                  <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-4 py-1 rounded-full uppercase tracking-widest">{enquiries.filter(e => e.status === 'new').length} Unread</span>
               </div>
               <div className="grid gap-6">
                  {enquiries.length > 0 ? (
                    enquiries.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map((enquiry) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={enquiry.id} 
                        className={cn(
                          "bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col md:flex-row gap-10 group relative transition-all",
                          enquiry.status === 'new' ? "border-pink-100 bg-gradient-to-br from-white to-pink-50/20 shadow-pink-50" : "border-gray-50"
                        )}
                      >
                         <div className="flex-1 flex gap-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-[1.5rem] flex items-center justify-center font-black text-gray-400 border border-gray-50">
                               {enquiry.userName?.[0]}
                            </div>
                            <div className="space-y-4">
                               <div>
                                  <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">{enquiry.userName}</h4>
                                  <div className="flex items-center space-x-6">
                                     <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"><Mail className="w-3 h-3 mr-2" /> {enquiry.userEmail}</span>
                                     <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest italic">Interests: Custom Rituals</span>
                                  </div>
                               </div>
                               <p className="text-sm text-gray-500 font-medium leading-relaxed italic border-l-2 border-pink-100 pl-6 py-2 bg-pink-50/10 rounded-r-2xl">"{enquiry.message}"</p>
                               
                               {enquiry.reply && (
                                 <div className="bg-gray-900 text-white p-6 rounded-2xl relative mt-4">
                                    <div className="absolute top-0 left-6 w-3 h-3 bg-gray-900 rotate-45 -translate-y-1.5" />
                                    <p className="text-[10px] font-black text-pink-500 uppercase mb-2">Your Reply</p>
                                    <p className="text-xs italic leading-relaxed">"{enquiry.reply}"</p>
                                 </div>
                               )}

                               {enquiry.status !== 'responded' && !enquiry.reply && (
                                  <div className="mt-6 flex flex-col space-y-4">
                                     <textarea 
                                       placeholder="Type your professional response..."
                                       value={replyText[enquiry.id] || ''}
                                       onChange={(e) => setReplyText({ ...replyText, [enquiry.id]: e.target.value })}
                                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:border-pink-500 outline-none resize-none transition-all"
                                       rows={2}
                                     />
                                     <button 
                                       onClick={() => handleReply(enquiry.id)}
                                       className="w-40 bg-pink-600 text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-700 transition-all shadow-lg"
                                     >
                                       Send Reply
                                     </button>
                                  </div>
                               )}
                            </div>
                         </div>
                         <div className="flex flex-col justify-between items-end gap-6 min-w-[200px]">
                            <div className="text-right">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Received At</p>
                               <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">
                                 {enquiry.createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                               </p>
                            </div>
                            <div className="flex gap-4 w-full">
                               {enquiry.status === 'new' ? (
                                 <button 
                                   onClick={() => handleEnquiryStatus(enquiry.id, 'read')}
                                   className="w-full bg-gray-900 text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-100"
                                 >
                                   Mark as Read
                                 </button>
                               ) : (
                                 <button 
                                   disabled
                                   className="w-full bg-gray-50 text-gray-400 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                 >
                                   Responded
                                 </button>
                               )}
                            </div>
                         </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center flex flex-col items-center">
                       <MessageSquare className="w-12 h-12 text-gray-200 mb-6" />
                       <p className="text-gray-400 font-black uppercase tracking-widest text-sm italic">Silence in the air. No enquiries received yet.</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </main>

      <AddServiceModal 
        key={editingService?.id || 'new'}
        isOpen={isModalOpen} 
        initialData={editingService}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }} 
        onSuccess={() => {
          setActiveTab('services');
          setEditingService(null);
        }}
      />
    </div>
  );
}

function NavItem({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center px-6 py-4 rounded-2xl transition-all group",
        active 
          ? "bg-pink-50 text-pink-600 shadow-sm" 
          : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn("w-5 h-5 mr-4 transition-transform", active ? "scale-110" : "group-hover:scale-110")} />
      <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", active ? "text-pink-600" : "")}>{label}</span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="ml-auto w-1.5 h-1.5 bg-pink-600 rounded-full"
        />
      )}
    </button>
  );
}
