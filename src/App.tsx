import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Discover } from './components/Discover';
import { Matches } from './components/Matches';
import { Chat } from './components/Chat';
import { Settings } from './components/Settings';
import { Gamepad2, HeartHandshake, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import { Match } from './types';

function MainApp() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'discover' | 'matches' | 'chat' | 'settings'>('discover');
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white font-black uppercase tracking-widest text-[#555]">Lancement de DuoQ...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col font-sans selection:bg-[#7C3AED]/30">
      <header className="px-8 h-20 flex items-center justify-between border-b border-[#2A2A2A] bg-[#0E0E0E] sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded flex items-center justify-center font-black text-2xl text-white">Q</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none mt-1">
            DuoQ
          </h1>
        </div>
        <nav className="flex items-center gap-8">
          <button 
            onClick={() => setCurrentView('discover')}
            className={`flex items-center gap-2 text-sm uppercase tracking-widest font-semibold transition-all duration-300 py-1 ${currentView === 'discover' ? 'border-b-2 border-[#7C3AED] text-white' : 'border-b-2 border-transparent text-[#888] hover:text-white'}`}
            title="Découvrir"
          >
            <HeartHandshake className="w-4 h-4" /> Arena
          </button>
          <button 
            onClick={() => {
              setCurrentView('matches');
              setActiveMatch(null);
            }}
            className={`flex items-center gap-2 text-sm uppercase tracking-widest font-semibold transition-all duration-300 py-1 ${currentView === 'matches' || currentView === 'chat' ? 'border-b-2 border-[#7C3AED] text-white' : 'border-b-2 border-transparent text-[#888] hover:text-white'}`}
            title="Matchs & Messages"
          >
            <MessageCircle className="w-4 h-4" /> Lobbies
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-2 text-sm uppercase tracking-widest font-semibold transition-all duration-300 py-1 ${currentView === 'settings' ? 'border-b-2 border-[#7C3AED] text-white' : 'border-b-2 border-transparent text-[#888] hover:text-white'}`}
            title="Profil"
          >
            <SettingsIcon className="w-4 h-4" /> Profil
          </button>
          
          <div className="w-px h-6 bg-[#333] mx-2"></div>
          
          <button 
            onClick={async () => {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./firebase');
              const { v4: uuidv4 } = await import('uuid');
              const fakeUsers = [
                { id: uuidv4(), email: 'toxic_yasuo@test.com', username: 'Toxic_Yasuo', bio: 'Mid or feed. Looking for a duo to reach Challenger.', games: 'League of Legends, Valorant', platforms: 'PC', playstyle: 'Tryharder', availabilities: 'Tous les soirs', relation_mode: '🖥️ PC' },
                { id: uuidv4(), email: 'mercy_uwu@test.com', username: 'Mercy_Main_UwU', bio: "Pocket healer looking for a carry. Please don't be toxic!", games: 'Overwatch 2, FFXIV', platforms: 'PC, PS5', playstyle: 'Support / Chill', availabilities: 'Week-ends', relation_mode: '🕹️ Joystick' },
                { id: uuidv4(), email: 'elden_lord@test.com', username: 'Elden_Lord', bio: 'Need help with Malenia. Also looking for a long term co-op partner.', games: 'Elden Ring, Dark Souls 3', platforms: 'PS5, Xbox Series', playstyle: 'Tryharder', availabilities: 'Après-midi', relation_mode: '🎮 Manette' },
                { id: uuidv4(), email: 'csgo_global@test.com', username: 'CSGO_Global', bio: 'Rush B no stop.', games: 'CS2, Apex Legends', platforms: 'PC', playstyle: 'Tryharder', availabilities: 'Nuit', relation_mode: "👾 Alien Pixel" },
                { id: uuidv4(), email: 'cozy_gamer@test.com', username: 'Cozy_Gamer_Girl', bio: 'Just want someone to build a farm with.', games: 'Stardew Valley, Animal Crossing', platforms: 'Switch, PC', playstyle: 'Chill', availabilities: 'Tous les jours', relation_mode: '🎮 Manette' }
              ];
              for (const fu of fakeUsers) {
                await setDoc(doc(db, 'users', fu.id), { ...fu });
              }
              alert('Faux profils générés !');
            }} 
            className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED] hover:text-[#9D5CFF] transition-colors"
          >
            SEED
          </button>

          <button onClick={logout} className="text-[10px] uppercase font-bold tracking-widest text-[#555] hover:text-red-500 transition-colors">
            Déconnexion
          </button>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {currentView === 'discover' && <Discover />}
        {currentView === 'matches' && <Matches onSelectMatch={(m) => { setActiveMatch(m); setCurrentView('chat'); }} />}
        {currentView === 'chat' && activeMatch && (
          <Chat match={activeMatch} onBack={() => { setActiveMatch(null); setCurrentView('matches'); }} />
        )}
        {currentView === 'settings' && <Settings onBack={() => setCurrentView('discover')} />}
      </main>
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

