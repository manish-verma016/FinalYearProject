import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, X, Shield, Users, Calendar, Trash2, CheckCircle2, AlertTriangle, 
  Sparkles, Send, Check, RefreshCw, Sliders, User, Store, Clock, Heart, 
  MapPin, CheckCircle, Info, ChevronDown, BadgeAlert
} from 'lucide-react';
import { useNotifications } from '../lib/NotificationContext';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { role, user } = useAuth();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    executeAction, 
    addNotification 
  } = useNotifications();

  // Active filter tab: 'my-role' (tailored for them), 'system-broadcasts' (everyone), 'all' (all logs)
  const [activeTabFilter, setActiveTabFilter] = useState('my-role');
  
  // Custom manual simulate broadcast state
  const [demoBroadcastTitle, setDemoBroadcastTitle] = useState('');
  const [demoBroadcastMsg, setDemoBroadcastMsg] = useState('');
  const [demoRoleToNotify, setDemoRoleToNotify] = useState('everyone');
  const [demoType, setDemoType] = useState('system');
  const [isSandboxOp, setIsSandboxOp] = useState(false);

  // Active presets for simulations
  const simulateBookingReq = () => {
    addNotification({
      title: 'New Celestial Booking Query 💍',
      message: `${user?.displayName || 'A Bride-to-be'} requested to reserve "Hilton Genome Valley Resort" for an upcoming winter wedding. Setup includes custom mandap decor & catering budget.`,
      type: 'booking',
      recipientRole: 'vendor',
      senderName: user?.displayName || 'User Client',
      targetId: 'service_hilton_val',
      targetName: "Hilton Genome Valley Resort",
      actionable: true,
      actionLabel: 'Confirm & Book Reservation'
    });
    toast.success('Simulation: Booking query logged & synced for Vendor review!');
  };

  const simulateNewServiceReq = () => {
    addNotification({
      title: 'New Service Listing Pending Review 🛠️',
      message: 'Vendor "Elite Flowers & Decor" submitted a luxury theme: "Heavenly Jasmine Garland Mandap" with premium astrology counseling.',
      type: 'service',
      recipientRole: 'admin',
      senderName: 'Elite Flowers Vendor',
      targetId: 'service_luxury_jasmine',
      targetName: 'Heavenly Jasmine Mandap',
      actionable: true,
      actionLabel: 'Validate & Activate Listing'
    });
    toast.success('Simulation: Service verification logged for Admin मनीष review!');
  };

  const simulateAdminConfirm = () => {
    addNotification({
      title: 'Wedding Reservation Accepted! 🎉',
      message: 'Your cosmic wedding venue booking for "Siri Nature\'s Valley Resort" has been validated and confirmed by Admin Manish. Check My Bookings portal.',
      type: 'booking',
      recipientRole: 'user',
      senderName: 'Admin Manish',
      targetId: 'venue_siri_natures',
      targetName: "Siri Nature's Valley Resort",
      actionable: false
    });
    toast.success('Simulation: Admin approval alert broadcasted to client!');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!demoBroadcastTitle.trim() || !demoBroadcastMsg.trim()) {
      toast.error('Specify alert heading and descriptive content');
      return;
    }

    addNotification({
      title: demoBroadcastTitle,
      message: demoBroadcastMsg,
      type: demoType,
      recipientRole: demoRoleToNotify,
      senderName: 'Simulation Broadcaster'
    });

    setDemoBroadcastTitle('');
    setDemoBroadcastMsg('');
    toast.success(`Successfully dispatched live broadcast targeting ${demoRoleToNotify}!`);
  };

  // Filter based on active drawer page selection
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeTabFilter === 'all') return true;
      if (activeTabFilter === 'system-broadcasts') {
        return n.recipientRole === 'everyone' || n.type === 'system';
      }
      
      // 'my-role' filter tailored exactly to who they are
      // If user is Admin, show admin or system or everyone
      // If user is Vendor, show vendor or everyone
      // If user is regular client, show user or everyone
      const currentRole = role || 'user';
      return n.recipientRole === currentRole || n.recipientUserId === user?.uid;
    });
  }, [notifications, activeTabFilter, role, user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[1000] backdrop-blur-sm"
          />

          {/* Sliding panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-[1001] shadow-2xl border-l border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Multi-Role Dashboard Header Segment */}
            <div className="relative overflow-hidden border-b border-gray-100">
              
              {/* Conditional background decorative gradients according to role needs */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                {role === 'admin' ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
                ) : role === 'vendor' ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-amber-500" />
                )}
              </div>

              {/* Header Context */}
              <div className="p-6 md:p-8 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
                      role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                      role === 'vendor' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-pink-50 text-pink-600'
                    }`}>
                      <Bell className="w-5 h-5 animate-swing" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-950 font-serif uppercase tracking-tight">
                        Celestial Control Desk
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          role === 'admin' ? 'bg-indigo-55/10 text-indigo-700 border-indigo-200' :
                          role === 'vendor' ? 'bg-emerald-55/10 text-emerald-700 border-emerald-200' :
                          'bg-pink-55/10 text-pink-700 border-pink-200'
                        }`}>
                          Role: {role || 'Guest Customer'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Live Synced DB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Specific Information Cards According To Role Need */}
                {role === 'admin' && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-indigo-700 font-black uppercase tracking-widest leading-none">Admin मनीष Command Hub</p>
                        <p className="text-xs text-gray-600 font-medium mt-1">Review listing approvals & site booking requests instantly.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">Manish Mode</span>
                  </div>
                )}

                {role === 'vendor' && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="w-8 h-8 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest leading-none">Vendor Live Itinerary</p>
                        <p className="text-xs text-gray-600 font-medium mt-1">Accept Client event bookings & track listing verifications.</p>
                      </div>
                    </div>
                  </div>
                )}

                {(!role || role === 'user') && (
                  <div className="bg-gradient-to-br from-pink-50/50 to-amber-50/50 border border-pink-100/60 rounded-2xl p-4">
                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-8 h-8 text-pink-500 shrink-0 animate-pulse" />
                        <div>
                          <p className="text-[10px] text-pink-700 font-black uppercase tracking-widest leading-none">Celestial Wedding Schedule</p>
                          <p className="text-xs text-gray-600 font-medium mt-1">Tracking your lucky Astro Vivah dates.</p>
                        </div>
                      </div>
                      
                      {/* Interactive countdown clock */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-pink-600 tracking-tighter">Nov 12</span>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none mt-0.5">Lucky Date</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scrolling Core Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
              
              {/* Navigation Filters targeting individual needs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-serif">
                    Filter Alert Streams
                  </h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black uppercase text-pink-600 tracking-wider hover:text-black transition-colors"
                  >
                    Mark All Seen
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-150">
                  <button
                    onClick={() => setActiveTabFilter('my-role')}
                    className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                      activeTabFilter === 'my-role'
                        ? 'bg-white text-gray-950 shadow-sm font-extrabold border border-gray-200'
                        : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    🎯 For Me ({
                      notifications.filter(n => role === 'admin' ? n.recipientRole === 'admin' : role === 'vendor' ? n.recipientRole === 'vendor' : n.recipientRole === 'user' || n.recipientUserId === user?.uid).length
                    })
                  </button>

                  <button
                    onClick={() => setActiveTabFilter('system-broadcasts')}
                    className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                      activeTabFilter === 'system-broadcasts'
                        ? 'bg-white text-gray-950 shadow-sm font-extrabold border border-gray-200'
                        : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    📢 Broadcasts ({
                      notifications.filter(n => n.recipientRole === 'everyone' || n.type === 'system').length
                    })
                  </button>

                  <button
                    onClick={() => setActiveTabFilter('all')}
                    className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                      activeTabFilter === 'all'
                        ? 'bg-white text-gray-950 shadow-sm font-extrabold border border-gray-200'
                        : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    🌐 All System ({notifications.length})
                  </button>
                </div>
              </div>

              {/* Main List Feed */}
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-6">
                    <Info className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">No matching notifications</p>
                    <p className="text-[9px] text-gray-400 font-medium px-4 mt-1.5 leading-relaxed">
                      All celestial processes are balanced. Use the simulation console below to generate realistic client booking events.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notif) => {
                      let typeIcon = '📢';
                      let roleBadgeColor = 'bg-gray-100 text-gray-700 border-gray-200';
                      
                      if (notif.type === 'booking') typeIcon = '💍';
                      if (notif.type === 'service') typeIcon = '🛠️';
                      if (notif.type === 'system') typeIcon = '⚠️';

                      if (notif.recipientRole === 'admin') roleBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                      if (notif.recipientRole === 'vendor') roleBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      if (notif.recipientRole === 'user') roleBadgeColor = 'bg-pink-50 text-pink-700 border-pink-100';
                      if (notif.recipientRole === 'everyone') roleBadgeColor = 'bg-amber-50 text-amber-700 border-amber-100';

                      return (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            if (!notif.read) markAsRead(notif.id);
                          }}
                          className={`p-4 rounded-[1.75rem] border flex gap-3 text-left transition-all duration-150 relative cursor-pointer ${
                            notif.read 
                              ? 'bg-white border-gray-150 opacity-70 hover:opacity-100' 
                              : 'bg-gradient-to-br from-pink-50/10 to-white border-pink-150 shadow-sm ring-1 ring-pink-100/20 hover:scale-[1.01]'
                          }`}
                        >
                          {/* Unread indicator */}
                          {!notif.read && (
                            <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#f43f5e] animate-ping" />
                          )}

                          {/* Left icon wrapper */}
                          <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-lg shrink-0 select-none border border-gray-100">
                            {typeIcon}
                          </div>

                          {/* Main content */}
                          <div className="flex-1 space-y-2 min-w-0 pr-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${roleBadgeColor}`}>
                                  {notif.recipientRole} Alert
                                </span>
                                <span className="text-[8px] text-gray-400 font-bold flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide leading-snug mt-1.5">
                                {notif.title}
                              </h4>
                            </div>

                            <p className="text-[11px] text-gray-500 font-medium select-text leading-relaxed">
                              {notif.message}
                            </p>

                            {/* Actions verification */}
                            {notif.actionable && notif.actionStatus === 'pending' && (
                              <div className="pt-2.5 border-t border-dashed border-gray-100 flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    executeAction(notif.id, 'completed');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all shadow-sm inline-flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve Listing
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    executeAction(notif.id, 'declined');
                                  }}
                                  className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-black text-[9px] uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all border border-transparent hover:border-red-100"
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                            {notif.actionable && notif.actionStatus !== 'pending' && (
                              <div className={`pt-2 border-t border-dashed border-gray-100 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.15em] ${notif.actionStatus === 'completed' ? 'text-emerald-600' : 'text-red-500'}`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Request {notif.actionStatus}
                              </div>
                            )}
                          </div>

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="text-gray-300 hover:text-red-500 hover:scale-110 duration-100 self-center shrink-0 p-1 rounded-lg hover:bg-gray-50"
                            title="Dismiss notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Simulator Section Accordion style */}
              <div className="border border-pink-100 rounded-3xl overflow-hidden bg-gradient-to-br from-pink-50/10 to-amber-50/10 p-5 mt-4">
                <button 
                  onClick={() => setIsSandboxOp(!isSandboxOp)}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-[10px] font-black text-pink-700 bg-pink-55/10 border border-pink-200 px-2.5 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" /> SIMULATOR PRESETS
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-pink-600 transition-transform ${isSandboxOp ? 'rotate-180' : ''}`} />
                </button>

                {isSandboxOp && (
                  <div className="pt-4 space-y-4">
                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                      Check each role's customized view by firing these real-time test alerts. These populate database documents so you can see live interactions instantly!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={simulateBookingReq}
                        className="p-3 bg-white hover:bg-pink-600 hover:text-white rounded-2xl border border-pink-100 hover:border-pink-500 text-[9px] font-black uppercase tracking-wider text-left transition-all duration-150 shadow-sm flex flex-col justify-between min-h-[75px] group"
                      >
                        <span className="text-pink-600 group-hover:text-white text-xs mb-1">💍</span>
                        <span>1. Client Booking</span>
                      </button>

                      <button
                        onClick={simulateNewServiceReq}
                        className="p-3 bg-white hover:bg-pink-600 hover:text-white rounded-2xl border border-pink-100 hover:border-pink-500 text-[9px] font-black uppercase tracking-wider text-left transition-all duration-150 shadow-sm flex flex-col justify-between min-h-[75px] group"
                      >
                        <span className="text-pink-600 group-hover:text-white text-xs mb-1">🛠️</span>
                        <span>2. Vendor Listing</span>
                      </button>

                      <button
                        onClick={simulateAdminConfirm}
                        className="p-3 bg-white hover:bg-pink-600 hover:text-white rounded-2xl border border-pink-100 hover:border-pink-500 text-[9px] font-black uppercase tracking-wider text-left transition-all duration-150 shadow-sm flex flex-col justify-between min-h-[75px] group"
                      >
                        <span className="text-pink-600 group-hover:text-white text-xs mb-1">👑</span>
                        <span>3. Admin Approval</span>
                      </button>
                    </div>

                    <div className="border-t border-dashed border-pink-200/60 pt-4">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <Send className="w-3.5 h-3.5 text-gray-400 font-semibold" /> Custom Alert Broadcasting
                      </p>

                      <form onSubmit={handleCustomSubmit} className="space-y-3">
                        <div>
                          <input 
                            type="text"
                            required
                            placeholder="Heading..."
                            value={demoBroadcastTitle}
                            onChange={(e) => setDemoBroadcastTitle(e.target.value)}
                            className="w-full text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-2 focus:border-pink-500 outline-none"
                          />
                        </div>

                        <div>
                          <textarea 
                            rows={2}
                            required
                            placeholder="Message..."
                            value={demoBroadcastMsg}
                            onChange={(e) => setDemoBroadcastMsg(e.target.value)}
                            className="w-full text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-2 focus:border-pink-500 outline-none resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-1">Role</label>
                            <select
                              value={demoRoleToNotify}
                              onChange={(e) => setDemoRoleToNotify(e.target.value)}
                              className="w-full text-[9px] font-bold text-gray-700 bg-white border border-gray-250 rounded-lg p-2 focus:bg-white outline-none"
                            >
                              <option value="everyone">Everyone 👥</option>
                              <option value="admin">Admins Only 🛡️</option>
                              <option value="vendor">Vendors Only 💼</option>
                              <option value="user">Users Only 👰</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                            <select
                              value={demoType}
                              onChange={(e) => setDemoType(e.target.value)}
                              className="w-full text-[9px] font-bold text-gray-700 bg-white border border-gray-250 rounded-lg p-2 focus:bg-white outline-none"
                            >
                              <option value="system">Astrology alert ⚠️</option>
                              <option value="booking">Wedding booking 💍</option>
                              <option value="service">Service Listing 🛠️</option>
                              <option value="general">Broadcast alert 📢</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gray-900 hover:bg-pink-600 text-white font-black text-[9px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-md"
                        >
                          Broadcast Custom Alert Live
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Status Panel */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[10px] font-semibold text-gray-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-gray-400" /> Active Profile: {role || 'Guest'}
              </span>
              <span className="font-bold uppercase tracking-wider">
                GATHBANDHAN CELESTIAL ALERTS
              </span>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
