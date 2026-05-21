import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Match as MatchType } from '../types';
import { Check, X, Star, Gamepad2, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, getDoc, serverTimestamp, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export function Discover() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get all my swipes
      const swipesRef = collection(db, 'swipes');
      const qSwipes = query(swipesRef, where('fromUserId', '==', user.id));
      const swipeDocs = await getDocs(qSwipes);
      const swipedUserIds = swipeDocs.docs.map(d => d.data().toUserId);

      // Get all users
      const usersRef = collection(db, 'users');
      const userDocs = await getDocs(usersRef);
      
      const availableProfiles: User[] = [];
      userDocs.forEach(doc => {
        const u = doc.data() as User;
        if (u.id !== user.id && !swipedUserIds.includes(u.id)) {
          availableProfiles.push(u);
        }
      });
      
      setProfiles(availableProfiles);
    } catch (e) {
      console.error("Error fetching profiles:", e);
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[0] || null;

  const handleSwipe = async (type: 'GG' | 'FF' | 'GOAT') => {
    if (!currentProfile || swipeDirection || !user) return;
    
    if (type === 'GG') setSwipeDirection('right');
    else if (type === 'FF') setSwipeDirection('left');
    else if (type === 'GOAT') setSwipeDirection('up');
    
    try {
      // Save Swipe
      const swipeId = `${user.id}_${currentProfile.id}`;
      await setDoc(doc(db, 'swipes', swipeId), {
        id: swipeId,
        fromUserId: user.id,
        toUserId: currentProfile.id,
        action: type,
        createdAt: Date.now()
      });

      let isMatch = false;

      // Check if it's a GG or GOAT and see if the other user also GG/GOAT me
      if (type === 'GG' || type === 'GOAT') {
        const reverseSwipeId = `${currentProfile.id}_${user.id}`;
        const reverseSwipeDoc = await getDoc(doc(db, 'swipes', reverseSwipeId));
        
        if (reverseSwipeDoc.exists()) {
          const reverseAction = reverseSwipeDoc.data().action;
          if (reverseAction === 'GG' || reverseAction === 'GOAT') {
            isMatch = true;
            // Create match
            const matchId = [user.id, currentProfile.id].sort().join('_');
            
            await setDoc(doc(db, 'matches', matchId), {
              id: matchId,
              user1Id: user.id,
              user2Id: currentProfile.id,
              createdAt: Date.now()
            });
          }
        }
      }
      
      setTimeout(() => {
        setProfiles(prev => prev.slice(1));
        setSwipeDirection(null);
        setShowDetails(false);
      }, 400);
      
    } catch (e) {
      console.error("Error saving swipe:", e);
      setSwipeDirection(null);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!currentProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 mix-blend-screen">
        <div className="w-16 h-16 bg-[#0E0E0E] rounded-full flex items-center justify-center mb-4 border border-[#2A2A2A]">
          <Gamepad2 className="w-6 h-6 text-[#555]" />
        </div>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Plus de profils</h2>
        <p className="text-[#888] max-w-xs mb-6 text-sm">Revenez plus tard pour découvrir de nouveaux joueurs dans votre région.</p>
        <button onClick={fetchProfiles} className="text-[#7C3AED] font-bold text-[10px] uppercase tracking-widest hover:text-[#6D28D9]">Rafraîchir</button>
      </div>
    );
  }

  const modeIcon = currentProfile.relation_mode.split(' ')[0];

  const exitVariants = {
    left: { x: -500, opacity: 0, rotate: -20 },
    right: { x: 500, opacity: 0, rotate: 20 },
    up: { y: -500, opacity: 0, rotate: 10 }
  };

  return (
    <section className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-md max-h-[70vh] min-h-[70vh] flex flex-col z-10 w-full h-[70vh]">
        <AnimatePresence>
          <motion.div 
            key={currentProfile.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
            exit={swipeDirection ? exitVariants[swipeDirection] : { opacity: 0 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
            className={`absolute inset-0 w-full h-full bg-[#111] rounded-3xl overflow-hidden border border-[#333] shadow-2xl flex flex-col`}
          >
            {/* Main Visual Section */}
            <div className={`relative ${showDetails ? 'h-32 sm:h-48' : 'flex-1'} transition-all duration-500 bg-[#222] shrink-0`}>
              {currentProfile.avatar_url ? (
                <img src={currentProfile.avatar_url} alt={currentProfile.username} className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-80" />
              ) : (
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
              
              <div className={`absolute left-6 z-20 transition-all duration-500 ${showDetails ? 'bottom-4' : 'bottom-8'}`}>
                <h2 className={`font-black italic tracking-tighter uppercase mb-1 leading-none text-white ${showDetails ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'}`}>
                  {currentProfile.username}
                </h2>
                {!showDetails && (
                  <div className="flex gap-2 items-center">
                    <span className="text-[#AAA] text-xs sm:text-sm uppercase font-semibold tracking-wider">{currentProfile.games.split(',')[0] || 'Gamer'} Main</span>
                    {currentProfile.gender && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#555]"></span>
                        <span className="text-[#AAA] text-xs sm:text-sm uppercase font-semibold tracking-wider">{currentProfile.gender}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="absolute top-6 right-6 z-20">
                 <div className="flex flex-col items-end gap-2">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                      <span className="text-lg sm:text-xl">{modeIcon}</span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none text-white">{currentProfile.relation_mode.substring(currentProfile.relation_mode.indexOf(' ') + 1)}</span>
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="absolute bottom-4 right-6 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
              >
                {showDetails ? <ArrowDown className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </button>
            </div>

            {/* Details Scrollable Section */}
            {showDetails && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A] p-6 -mt-2 relative z-20"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] text-[#555] uppercase font-bold tracking-widest mb-2">Bio</h3>
                    <p className="text-sm text-[#CCC] leading-relaxed">{currentProfile.bio || "Aucune bio fournie."}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                      <h3 className="text-[10px] text-[#555] uppercase font-bold tracking-widest mb-1">Playstyle</h3>
                      <p className="text-sm text-[#EEE] font-medium">{currentProfile.playstyle}</p>
                    </div>
                    <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                      <h3 className="text-[10px] text-[#555] uppercase font-bold tracking-widest mb-1">Disponibilités</h3>
                      <p className="text-sm text-[#EEE] font-medium">{currentProfile.availabilities}</p>
                    </div>
                  </div>

                  <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                    <h3 className="text-[10px] text-[#555] uppercase font-bold tracking-widest mb-2">Plateformes</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.platforms?.split(',').map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-[#222] text-[#AAA] text-xs font-bold rounded uppercase tracking-wider">{p.trim()}</span>
                      ))}
                    </div>
                  </div>

                  {currentProfile.questionnaire && Object.keys(currentProfile.questionnaire).length > 0 && (
                    <div className="pt-4 border-t border-[#222] space-y-4">
                      <h3 className="text-[10px] text-[#7C3AED] uppercase font-bold tracking-widest">Questionnaire de Match</h3>
                      {currentProfile.questionnaire.q1 && (
                        <div>
                          <span className="text-[#888] block text-[10px] uppercase font-bold mb-1">Coéquipier in-game</span>
                          <p className="text-[#CCC] text-sm bg-[#151515] p-3 rounded-lg border border-[#222]">{currentProfile.questionnaire.q1}</p>
                        </div>
                      )}
                      {currentProfile.questionnaire.q2 && (
                        <div>
                          <span className="text-[#888] block text-[10px] uppercase font-bold mb-1">Réaction feed mate</span>
                          <p className="text-[#CCC] text-sm bg-[#151515] p-3 rounded-lg border border-[#222]">{currentProfile.questionnaire.q2}</p>
                        </div>
                      )}
                      {currentProfile.questionnaire.q3 && (
                        <div>
                          <span className="text-[#888] block text-[10px] uppercase font-bold mb-1">Recherche Idéale</span>
                          <p className="text-[#CCC] text-sm bg-[#151515] p-3 rounded-lg border border-[#222]">{currentProfile.questionnaire.q3}</p>
                        </div>
                      )}
                      {currentProfile.questionnaire.q4 && (
                        <div>
                          <span className="text-[#888] block text-[10px] uppercase font-bold mb-1">Vocal vs Ping</span>
                          <p className="text-[#CCC] text-sm bg-[#151515] p-3 rounded-lg border border-[#222]">{currentProfile.questionnaire.q4}</p>
                        </div>
                      )}
                      {currentProfile.questionnaire.q5 && (
                        <div>
                          <span className="text-[#888] block text-[10px] uppercase font-bold mb-1">Meilleur souvenir g.</span>
                          <p className="text-[#CCC] text-sm bg-[#151515] p-3 rounded-lg border border-[#222]">{currentProfile.questionnaire.q5}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Game Tags Bar (Hidden when details open) */}
            {!showDetails && (
              <div className="h-20 sm:h-24 bg-[#0A0A0A] border-t border-[#2A2A2A] px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex gap-3 overflow-x-auto custom-scrollbar overflow-y-hidden pb-1">
                  {currentProfile.games.split(',').map((game, i) => game.trim() ? (
                    <div key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-[10px] uppercase font-bold text-[#AAA] whitespace-nowrap">
                      {game.trim()}
                    </div>
                  ) : null)}
                </div>
                <div className="text-right shrink-0 ml-4 hidden sm:block">
                  <p className="text-[9px] text-[#555] uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className="text-xs font-mono text-[#888]">Locked</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Decision Floating Actions - Now placed below the card */}
      <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 shrink-0 h-24">
        <button 
          onClick={() => handleSwipe('FF')}
          disabled={!!swipeDirection}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center hover:bg-[#2A1010] hover:border-red-500/50 hover:text-red-500 group transition-all"
        >
          <span className="text-lg sm:text-xl font-black text-[#888] group-hover:text-red-500 transition-colors">FF</span>
        </button>  
        <button 
          onClick={() => handleSwipe('GG')}
          disabled={!!swipeDirection}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.3)] border border-[#7C3AED]/30 flex items-center justify-center hover:scale-105 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all"
        >
          <span className="text-2xl sm:text-3xl font-black italic text-white mt-0.5">GG</span>
        </button>
        <button 
          onClick={() => handleSwipe('GOAT')}
          disabled={!!swipeDirection}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center hover:bg-[#251A0A] hover:border-yellow-500/50 hover:scale-110 transition-all text-xl sm:text-2xl shadow-lg"
          title="Greatest Of All Time Match"
        >
          🐐
        </button>
      </div>
    </section>
  );
}
