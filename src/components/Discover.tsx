import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Match as MatchType } from '../types';
import { Check, X, Star, Gamepad2, Info } from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, getDoc, serverTimestamp, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function Discover() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchAlert, setMatchAlert] = useState<MatchType | null>(null);

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
    if (!currentProfile || swiping || !user) return;
    
    setSwiping(true);
    
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
      let newMatch: MatchType | null = null;

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
            
            // Wait, we need the Match type to have username and games for local context, 
            // but in DB it's just user1Id and user2Id.
            await setDoc(doc(db, 'matches', matchId), {
              id: matchId,
              user1Id: user.id,
              user2Id: currentProfile.id,
              createdAt: Date.now()
            });
            
            newMatch = {
              match_id: matchId,
              user_id: currentProfile.id,
              username: currentProfile.username,
              games: currentProfile.games,
              platforms: currentProfile.platforms,
              playstyle: currentProfile.playstyle,
              availabilities: currentProfile.availabilities,
              discord_username: currentProfile.discord_username,
              bio: currentProfile.bio,
              relation_mode: currentProfile.relation_mode,
              created_at: new Date().toISOString()
            };
          }
        }
      }
      
      setTimeout(() => {
        setProfiles(prev => prev.slice(1));
        setSwiping(false);
        if (isMatch && newMatch) {
          setMatchAlert(newMatch);
        }
      }, 300);
      
    } catch (e) {
      console.error("Error saving swipe:", e);
      setSwiping(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (matchAlert) {
    return (
      <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-[#7C3AED]/20 rounded-full flex items-center justify-center mb-6">
          <Gamepad2 className="w-12 h-12 text-[#7C3AED]" />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">IT'S A MATCH!</h2>
        <p className="text-[#888] mb-8 max-w-sm text-sm">
          Vous et {matchAlert.username} avez GG mutuellement. Vous pouvez maintenant voir le profil complet et commencer à discuter.
        </p>
        <button 
          onClick={() => setMatchAlert(null)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg py-3 px-8 text-[10px] uppercase font-bold tracking-widest transition-all"
        >
          Continuer à découvrir
        </button>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0A0A0A]">
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

  return (
    <section className="flex-1 relative flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#1a102e_0%,_#0a0a0a_70%)] overflow-hidden">
      <div className={`relative w-full max-w-2xl max-h-[75vh] aspect-[4/5] bg-[#111] rounded-3xl overflow-hidden border border-[#333] shadow-2xl flex flex-col transition-transform duration-300 ${swiping ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Profile Image Placeholder */}
        <div className="relative flex-1 bg-[#222]">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          
          <div className="absolute bottom-8 left-8 z-20">
            <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2 leading-none text-white">
              {currentProfile.username}
            </h2>
            <div className="flex gap-2 items-center">
              <span className="text-[#AAA] text-sm uppercase font-semibold tracking-wider">{currentProfile.games.split(',')[0] || 'Gamer'} Main</span>
            </div>
          </div>
          
          <div className="absolute top-8 right-8 z-20">
             <div className="flex flex-col items-end gap-2">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                  <span className="text-xl">{modeIcon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest leading-none text-white">{currentProfile.relation_mode.split(' - ').pop()?.replace(/[^a-zA-Z]/g, '').trim()}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Game Tags Bar */}
        <div className="h-24 bg-[#0A0A0A] border-t border-[#2A2A2A] px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {currentProfile.games.split(',').map((game, i) => game.trim() ? (
              <div key={i} className="px-3 py-1 border border-[#444] rounded text-[10px] uppercase font-bold text-[#888] whitespace-nowrap">
                {game.trim()}
              </div>
            ) : null)}
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-[10px] text-[#555] uppercase font-bold tracking-widest mb-1">Status</p>
            <p className="text-xs font-mono text-[#888]">Locked</p>
          </div>
        </div>
      </div>
      
      {/* Decision Floating Actions */}
      <div className="absolute bottom-10 flex gap-6 z-30">
        <button 
          onClick={() => handleSwipe('FF')}
          disabled={swiping}
          className="w-16 h-16 rounded-full bg-[#1A1A1A] border-2 border-[#333] flex items-center justify-center hover:bg-[#222] hover:border-red-500 group transition-all"
        >
          <span className="text-xl font-black text-[#F0F0F0] group-hover:text-red-500">FF</span>
        </button>
        <button 
          onClick={() => handleSwipe('GG')}
          disabled={swiping}
          className="w-20 h-20 rounded-full bg-[#7C3AED] border-2 border-transparent flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-105 transition-transform"
        >
          <span className="text-2xl font-black italic text-white mt-1">GG</span>
        </button>
        <button 
          onClick={() => handleSwipe('GOAT')}
          disabled={swiping}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)] text-2xl"
        >
          🐐
        </button>
      </div>
    </section>
  );
}
