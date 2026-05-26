import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose }) {
  const { refreshRole } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        const user = await signUpWithEmail(formData.email, formData.password, formData.displayName);
        // Force update the profile in context/firestore
        await refreshRole({ displayName: formData.displayName });
        toast.success('Account created successfully!');
      }
      onClose();
    } catch (error) {
      console.error("Auth error:", error);
      let message = 'Authentication failed';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      onClose();
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="relative h-32 bg-gray-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#ec4899,transparent)]" />
            </div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                <img src="/logo.svg" alt="Gathbandhan" className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase italic">
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </h2>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full h-14 bg-gray-50 rounded-2xl pl-12 pr-6 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all border border-gray-50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 bg-gray-50 rounded-2xl pl-12 pr-6 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all border border-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 bg-gray-50 rounded-2xl pl-12 pr-6 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-pink-100 transition-all border border-gray-50"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-pink-600 transition-all flex items-center justify-center group shadow-xl shadow-gray-200/50 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center px-4">
                <div className="w-full border-t border-gray-100" />
              </div>
              <span className="relative bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">OR</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all group shadow-sm"
              >
                <Chrome className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Continue with Google</span>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="mt-2 text-[11px] font-black text-pink-600 uppercase tracking-[0.2em] hover:text-pink-700 transition-colors"
              >
                {isLogin ? 'Create Account' : 'Login Instead'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
