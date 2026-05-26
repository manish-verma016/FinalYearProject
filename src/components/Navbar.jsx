import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Menu, X, LayoutDashboard, UserPlus, Shield, LogOut, Calendar, Star, Mail, Bell, Wallet } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';
import { useNotifications } from '../lib/NotificationContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { user, role, isImpersonating, stopImpersonating } = useAuth();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleStopImpersonating = () => {
    stopImpersonating();
    toast.success('Returned to Admin view');
    navigate('/admin');
  };

  const handleSignOut = async () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    await auth.signOut();
    setShowDropdown(false);
    navigate('/');
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 1500);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Venues', href: '/venues' },
    { name: 'Services', href: '/services' },
    { name: 'AI Planner', href: '/ai-planner' },
    { name: 'Astro Tools', href: '/astro-tools' },
    { name: 'Invitations', href: '/invitations' },
    { name: 'Become Vendor', href: '/become-vendor' },
  ];

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      {isImpersonating && (
        <div className="bg-pink-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center space-x-4">
          <span>Presentation Mode: You are viewing as a {role}</span>
          <button 
            onClick={handleStopImpersonating}
            className="bg-white text-pink-600 px-3 py-1 rounded-md text-[9px] hover:bg-pink-50 transition-colors"
          >
            Exit Demo
          </button>
        </div>
      )}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/logo.svg" alt="Gathbandhan Logo" className="w-12 h-12 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black tracking-tight text-gray-900 font-serif">Gathbandhan</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative text-sm font-bold uppercase tracking-widest transition-all",
                    isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.75 bg-gray-900 rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {/* Notification Bell Icon trigger */}
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors focus:outline-none"
              title="Open alert notification control panel"
            >
              <Bell className="w-5.5 h-5.5" />
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#e22727] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                {unreadCount || 12}
              </span>
            </button>

            {user ? (
              <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-pink-100 p-0.5"
                    referrerPolicy="no-referrer"
                  />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl shadow-gray-200 border border-gray-50 py-6 overflow-hidden z-[100]"
                    >
                      <div className="px-8 pb-6 border-b border-gray-50 flex items-center space-x-4">
                        <img
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                          alt="Profile"
                          className="w-14 h-14 rounded-2xl object-cover ring-4 ring-pink-50"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-black text-gray-900 truncate leading-tight">{user.displayName}</p>
                          <p className="text-[10px] text-gray-400 font-bold truncate tracking-tight mb-2">{user.email}</p>
                          <span className="inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-black bg-pink-50 text-pink-600 rounded-lg">
                            {role || 'Guest'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="px-4 pt-4 space-y-1">
                        <Link to="/bookings" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <LayoutDashboard className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> My Dashboard
                        </Link>

                        <Link to="/budget" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <Wallet className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Budget Tracker
                        </Link>
                        <Link to="/guest-list" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <UserPlus className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Guest List
                        </Link>

                        <Link to="/invitations" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <Mail className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Invitations
                        </Link>

                        <Link to="/astro-tools" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <Star className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Astro Tools
                        </Link>
                        
                        <Link to="/become-vendor" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <Calendar className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Become a Vendor
                        </Link>

                        {role === 'admin' && (
                          <Link to="/admin" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                            <Shield className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Admin Panel
                          </Link>
                        )}
                        
                        {(role === 'vendor' || role === 'admin') && (
                          <Link to="/vendor" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                            <LayoutDashboard className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Vendor Dashboard
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-4 py-3 text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all group"
                        >
                          <LogOut className="w-4 h-4 mr-4 text-red-300 group-hover:translate-x-1 transition-transform" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Actions and Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-gray-500 hover:text-black focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-5.5 h-5.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e22727] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {user ? (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-pink-100 rounded-full"
                title="User account menu"
              >
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-pink-200 p-0.5 object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsOpen(false);
                }}
                className="text-[10px] uppercase font-black tracking-widest text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full"
                title="Sign in to your account"
              >
                Sign In
              </button>
            )}

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-600 p-2 focus:outline-none"
              title="Menu toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-150 overflow-y-auto max-h-[calc(100vh-5rem)]"
          >
            {/* User details card at top of mobile menu */}
            {user && (
              <div className="px-6 py-5 bg-gradient-to-r from-pink-50/20 to-amber-50/20 border-b border-gray-100 flex items-center space-x-4">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                  alt="Profile"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-pink-100/50"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-gray-900 truncate leading-tight">{user.displayName || 'Gathbandhan User'}</p>
                  <p className="text-[10px] text-gray-400 font-bold truncate tracking-tight">{user.email}</p>
                  <span className="inline-block px-2.5 py-0.5 text-[8px] uppercase tracking-widest font-black bg-pink-100 text-pink-700 rounded-md mt-1.5 border border-pink-200/40">
                    {role || 'Guest'}
                  </span>
                </div>
              </div>
            )}

            <div className="px-4 py-5 space-y-1">
              <span className="block text-[8px] font-black text-gray-400 tracking-widest uppercase px-4 mb-2 select-none">General Menu</span>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                      isActive ? "bg-pink-50 text-pink-600 font-black border-l-4 border-pink-600 rounded-l-none" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {user ? (
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
                  <span className="block text-[8px] font-black text-gray-400 tracking-widest uppercase px-4 mb-2 select-none">Personal Planners</span>
                  
                  <Link
                    to="/bookings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> My Dashboard
                  </Link>
                  
                  <Link
                    to="/budget"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                  >
                    <Wallet className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> Budget Tracker
                  </Link>

                  <Link
                    to="/guest-list"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                  >
                    <UserPlus className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> Guest List
                  </Link>

                  <Link
                    to="/invitations"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                  >
                    <Mail className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> Invitations
                  </Link>

                  <Link
                    to="/astro-tools"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                  >
                    <Star className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> Astro Tools
                  </Link>

                  <Link
                    to="/become-vendor"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                  >
                    <Calendar className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> Become a Vendor
                  </Link>

                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl border-t border-gray-50 mt-1"
                    >
                      <Shield className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> Admin Panel
                    </Link>
                  )}

                  {(role === 'vendor' || role === 'admin') && (
                    <Link
                      to="/vendor"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3 text-pink-500 shrink-0" /> Vendor Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 mt-4 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl text-left"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-400 shrink-0" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-lg shadow-pink-100"
                  >
                    Sign In to Account
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
    />

    <NotificationDrawer 
      isOpen={isNotifOpen} 
      onClose={() => setIsNotifOpen(false)} 
    />
    </>
  );
}
