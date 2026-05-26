import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

import { INSPIRATIONS } from '../constants';

const categories = ['All Styles', 'Royal Wedding', 'Traditional', 'Modern'];

export default function Inspiration() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [likedIds, setLikedIds] = useState(new Set());
  const [userLikes, setUserLikes] = useState([]);

  useEffect(() => {
    if (!user) {
      setLikedIds(new Set());
      return;
    }

    const q = query(collection(db, 'user_likes'), where('userId', '==', user.uid), where('type', '==', 'inspiration'));
    const unsub = onSnapshot(q, (snapshot) => {
      const likes = snapshot.docs.map(doc => ({ id: doc.id, targetId: doc.data().targetId }));
      setUserLikes(likes);
      setLikedIds(new Set(likes.map(l => l.targetId)));
    });

    return unsub;
  }, [user]);

  const toggleLike = async (item) => {
    if (!user) {
      toast.error('Please sign in to save inspirations!');
      return;
    }

    const isLiked = likedIds.has(item.id);
    
    try {
      if (isLiked) {
        const likeDoc = userLikes.find(l => l.targetId === item.id);
        if (likeDoc) {
          await deleteDoc(doc(db, 'user_likes', likeDoc.id));
          toast.success('Removed from collection');
        }
      } else {
        await addDoc(collection(db, 'user_likes'), {
          userId: user.uid,
          targetId: item.id,
          type: 'inspiration',
          data: item,
          createdAt: serverTimestamp()
        });
        toast.success('Saved to your collection!', {
          icon: '💖',
          style: { borderRadius: '1rem', background: '#333', color: '#fff' }
        });
      }
    } catch (error) {
      toast.error('Failed to update collection');
    }
  };

  const filteredInspirations = INSPIRATIONS.filter(item => 
    activeCategory === 'All Styles' || item.category === activeCategory
  );

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xs font-bold text-pink-600 uppercase tracking-[0.4em] mb-4">Visual Journey</h2>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 font-serif leading-tight mb-4">Gallery of Dreams</h1>
          <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">Curated architectural and aesthetic inspirations for your perfect day.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                activeCategory === category
                  ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                  : "bg-white text-gray-400 border border-gray-100 hover:border-gray-300 hover:text-gray-900"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredInspirations.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white border border-gray-100"
              >
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  alt={item.title}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-pink-500 uppercase tracking-[0.4em] block mb-1">
                      {item.type}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-tight group-hover:text-pink-100 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Subtle Action Indicator */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(item);
                    }}
                    className={cn(
                      "w-10 h-10 backdrop-blur-md rounded-xl flex items-center justify-center transition-all shadow-lg",
                      likedIds.has(item.id) 
                        ? "bg-pink-600 text-white" 
                        : "bg-white/20 text-white hover:bg-white/40"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", likedIds.has(item.id) && "fill-current")} />
                  </button>
                  <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-pink-600 transition-all shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-20 text-center">
          <button className="inline-flex items-center space-x-3 group bg-white border border-gray-100 px-10 py-5 rounded-full shadow-lg hover:shadow-2xl transition-all">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-900">Explore Full Collection</span>
            <div className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 transition-transform group-hover:rotate-12">
              <Sparkles className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
