import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Discover } from './components/Discover';
import { Matches } from './components/Matches';
import { Chat } from './components/Chat';
import { Settings } from './components/Settings';
import { Gamepad2, HeartHandshake, MessageCircle, Settings as SettingsIcon, X } from 'lucide-react';
import { Match, User } from './types';
import { collection, query, or, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { motion, AnimatePresence } from 'motion/react';

function MainApp() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'discover' | 'matches' | 'chat' | 'settings'>('discover');
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [hasNewMatches, setHasNewMatches] = useState(false);
  const [globalMatchAlert, setGlobalMatchAlert] = useState<{username: string} | null>(null);
  const [globalMessageAlert, setGlobalMessageAlert] = useState<{username: string, content: string, match: Match} | null>(null);
  const initialLoadRef = useRef(true);
  const currentViewRef = useRef(currentView);
  const activeMatchRef = useRef(activeMatch);
  const alertedMessagesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    activeMatchRef.current = activeMatch;
  }, [activeMatch]);

  useEffect(() => {
    if (!user) return;

    initialLoadRef.current = true; // reset on user change

    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, or(where('user1Id', '==', user.id), where('user2Id', '==', user.id)));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const isInitial = initialLoadRef.current;
      initialLoadRef.current = false;

      let hasUnread = false;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data[`unreadBy_${user.id}`] === true) {
          if (currentViewRef.current === 'chat' && activeMatchRef.current?.match_id === doc.id) {
            // Actively viewing, don't count as unread here
          } else {
            hasUnread = true;
          }
        }
      });
      setHasNewMatches(hasUnread);

      snapshot.docChanges().forEach(async (change) => {
        const matchData = change.doc.data();
        const opponentId = matchData.user1Id === user.id ? matchData.user2Id : matchData.user1Id;
        
        if (change.type === 'added' && !isInitial) {
          if (opponentId) {
            const opDoc = await getDoc(doc(db, 'users', opponentId));
            const opponentName = opDoc.exists() ? (opDoc.data().username || 'Un joueur') : 'Un joueur';
            setGlobalMatchAlert({ username: opponentName });
          }
        } else if (change.type === 'modified') {
          if (matchData[`unreadBy_${user.id}`] === true) {
            if (currentViewRef.current !== 'chat' || activeMatchRef.current?.match_id !== change.doc.id) {
              if (matchData.lastMessage && matchData.lastMessage.senderId !== user.id) {
                const msgTime = matchData.lastMessage.createdAt;
                if (!alertedMessagesRef.current.has(msgTime)) {
                  alertedMessagesRef.current.add(msgTime);
                  const opDoc = await getDoc(doc(db, 'users', opponentId));
                  const opData = opDoc.exists() ? opDoc.data() as User : null;
                  const opponentName = opData?.username || 'Un joueur';
                  
                  const matchObj: Match = {
                    match_id: change.doc.id,
                    id: opponentId,
                    user_id: opponentId,
                    username: opponentName,
                    bio: opData?.bio || '',
                    games: opData?.games || '',
                    platforms: opData?.platforms || '',
                    playstyle: opData?.playstyle || '',
                    availabilities: opData?.availabilities || '',
                    relation_mode: opData?.relation_mode || 'Casual',
                    discord_username: opData?.discord_username || '',
                  };

                  setGlobalMessageAlert({ username: opponentName, content: matchData.lastMessage.content, match: matchObj });
                  setTimeout(() => setGlobalMessageAlert(null), 5000);
                }
              }
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white font-black uppercase tracking-widest text-[#555]">Lancement de DuoQ...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-black text-[#F0F0F0] flex flex-col font-sans selection:bg-[#7C3AED]/30 relative overflow-hidden">
      {/* Deep Space Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,_#1c103f_0%,_#000000_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#7C3AED]/10 to-transparent"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
      </div>
      
      <div className="flex-1 flex flex-col relative z-10 h-screen">
      {globalMatchAlert && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <button 
            onClick={() => setGlobalMatchAlert(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-24 h-24 bg-[#7C3AED]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(124,58,237,0.3)]">
            <HeartHandshake className="w-12 h-12 text-[#7C3AED]" />
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white mb-2">IT'S A MATCH!</h2>
          <p className="text-[#888] mb-8 max-w-sm text-sm">
            Vous et <span className="text-white font-bold">{globalMatchAlert.username}</span> avez GG mutuellement. Une nouvelle connexion est née !
          </p>
          <button 
            onClick={() => {
              setGlobalMatchAlert(null);
              setCurrentView('matches');
              setActiveMatch(null);
            }}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg py-3 px-8 text-[10px] uppercase font-bold tracking-widest transition-all"
          >
            Aller aux Lobbies
          </button>
        </div>
      )}

      {globalMessageAlert && (
        <div 
          onClick={() => {
            setGlobalMessageAlert(null);
            setCurrentView('chat');
            setActiveMatch(globalMessageAlert.match);
          }}
          className="fixed top-24 right-8 z-50 bg-[#0E0E0E] hover:bg-[#151515] transition-colors cursor-pointer border border-[#7C3AED] rounded-xl p-4 shadow-[0_0_20px_rgba(124,58,237,0.3)] animate-in slide-in-from-right-8 duration-300 w-80 max-w-[calc(100vw-40px)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[#1A1A1A] border border-[#333] rounded-full shrink-0">
              <MessageCircle className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold italic tracking-tight truncate">{globalMessageAlert.username}</h4>
              <p className="text-sm text-[#888] truncate">{globalMessageAlert.content}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setGlobalMessageAlert(null);
              }}
              className="p-1 -mr-1 -mt-1 text-[#555] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className="px-6 sm:px-10 h-20 flex items-center justify-between bg-black/40 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-40 transition-colors shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DuoQ Logo" className="w-10 h-10 object-contain rounded-lg" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
          <div className="w-10 h-10 bg-gradient-to-tr from-[#6D28D9] to-[#7C3AED] rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg hidden">Q</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none mt-1 drop-shadow-md">
            DuoQ
          </h1>
        </div>
        <nav className="flex items-center gap-4 sm:gap-8">
          <button 
            onClick={() => setCurrentView('discover')}
            className={`flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all duration-300 py-2 relative group ${currentView === 'discover' ? 'text-white' : 'text-[#888] hover:text-white'}`}
            title="Découvrir"
          >
            <Gamepad2 className={`w-4 h-4 transition-transform duration-300 ${currentView === 'discover' ? 'scale-110 text-[#7C3AED]' : 'group-hover:scale-110'}`} /> 
            <span className="hidden sm:inline">Arena</span>
            {currentView === 'discover' && <motion.div layoutId="nav-pill" className="absolute -bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent rounded-t-full" />}
          </button>
          <button 
            onClick={() => {
              setCurrentView('matches');
              setActiveMatch(null);
            }}
            className={`relative flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all duration-300 py-2 group ${currentView === 'matches' || currentView === 'chat' ? 'text-white' : 'text-[#888] hover:text-white'}`}
            title="Matchs & Messages"
          >
            <MessageCircle className={`w-4 h-4 transition-transform duration-300 ${currentView === 'matches' || currentView === 'chat' ? 'scale-110 text-[#7C3AED]' : 'group-hover:scale-110'}`} />
            <span className="hidden sm:inline">Lobbies</span>
            {(currentView === 'matches' || currentView === 'chat') && <motion.div layoutId="nav-pill" className="absolute -bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent rounded-t-full" />}
            {hasNewMatches && (
              <span className="absolute top-1 sm:top-2 -right-2 sm:-right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all duration-300 py-2 relative group ${currentView === 'settings' ? 'text-white' : 'text-[#888] hover:text-white'}`}
            title="Profil"
          >
            <SettingsIcon className={`w-4 h-4 transition-transform duration-300 ${currentView === 'settings' ? 'scale-110 text-[#7C3AED]' : 'group-hover:scale-110'}`} />
            <span className="hidden sm:inline">Profil</span>
            {currentView === 'settings' && <motion.div layoutId="nav-pill" className="absolute -bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent rounded-t-full" />}
          </button>
          
          <button onClick={logout} className="ml-2 sm:ml-4 text-[10px] uppercase font-bold tracking-widest text-[#555] hover:text-red-500 transition-colors bg-white/5 hover:bg-red-500/10 px-3 py-1.5 rounded-full">
            Out
          </button>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col absolute inset-0"
          >
            {currentView === 'discover' && <Discover />}
            {currentView === 'matches' && <Matches onSelectMatch={(m) => { setActiveMatch(m); setCurrentView('chat'); }} />}
            {currentView === 'chat' && activeMatch && (
              <Chat match={activeMatch} onBack={() => { setActiveMatch(null); setCurrentView('matches'); }} />
            )}
            {currentView === 'settings' && <Settings onBack={() => setCurrentView('discover')} />}
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

