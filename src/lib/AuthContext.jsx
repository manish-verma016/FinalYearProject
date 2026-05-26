import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "motion/react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext({
  user: null,
  role: null,
  profile: null,
  loading: true,
  refreshRole: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const effectiveRole = impersonatedUser?.role || role;
  const effectiveProfile = impersonatedUser || profile;

  const fetchRole = async (uid, forceUpdate = {}, retryCount = 0) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (Object.keys(forceUpdate).length > 0) {
           const updatedProfile = { ...data, ...forceUpdate };
           await setDoc(doc(db, "users", uid), updatedProfile, { merge: true });
           setRole(updatedProfile.role || data.role);
           setProfile(updatedProfile);
        } else {
           setRole(data.role);
           setProfile(data);
        }
      } else {
        const newRole = auth.currentUser?.email === 'manish847593@gmail.com' ? 'admin' : 'user';
        const newProfile = {
          uid,
          email: auth.currentUser?.email,
          displayName: forceUpdate.displayName || auth.currentUser?.displayName || 'User',
          photoURL: auth.currentUser?.photoURL || '',
          role: newRole,
          createdAt: serverTimestamp(),
          ...forceUpdate
        };
        await setDoc(doc(db, "users", uid), newProfile);
        setRole(newRole);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      // Soft retry for "offline" errors
      if (retryCount < 2 && (error.message?.includes('offline') || error.message?.includes('Cloud Firestore backend'))) {
        setTimeout(() => fetchRole(uid, forceUpdate, retryCount + 1), 2000);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchRole(user.uid);
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshRole = async (updates = {}) => {
    if (user) await fetchRole(user.uid, updates);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="relative"
        >
          <div className="absolute inset-0 bg-pink-100 rounded-full blur-2xl opacity-50 animate-pulse" />
          <img src="/logo.svg" alt="Loading..." className="w-24 h-24 relative z-10" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col items-center"
        >
          <h1 className="text-2xl font-black text-gray-900 font-serif tracking-tight">Gathbandhan</h1>
          <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] mt-2">Celestial Wedding Planner</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: effectiveRole, 
      profile: effectiveProfile, 
      loading, 
      refreshRole,
      isImpersonating: !!impersonatedUser,
      impersonate: (u) => setImpersonatedUser(u),
      stopImpersonating: () => setImpersonatedUser(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
}
