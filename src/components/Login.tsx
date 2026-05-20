import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gamepad2, ArrowRight } from 'lucide-react';

const RELATION_MODES = [
  { id: '🎮 Manette', label: 'Manette (Relation sérieuse)' },
  { id: '🕹️ Joystick', label: 'Joystick (Relation décontractée / Co-op)' },
  { id: '👾 Alien Pixel', label: "Alien Pixel (Plan d'un soir)" },
  { id: '🖥️ PC', label: 'PC (Tryhard / Compétitif)' }
];

export function Login() {
  const { login, register } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Profile elements
  const [bio, setBio] = useState('');
  const [games, setGames] = useState('');
  const [platforms, setPlatforms] = useState('');
  const [playstyle, setPlaystyle] = useState('');
  const [availabilities, setAvailabilities] = useState('');
  const [relationMode, setRelationMode] = useState(RELATION_MODES[0].id);
  const [isAdult, setIsAdult] = useState(false);
  
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (view === 'login') {
      // The login is usually done with email or username now. We pass username here which is typed into the "Pseudo IG / Email" field.
      const res = await login(username, password);
      if (res?.error) setError(res.error);
    } else {
      if (step === 1) {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError("Veuillez remplir tous les champs.");
          return;
        }
        if (!isAdult) {
          setError("Vous devez avoir plus de 18 ans pour vous inscrire.");
          return;
        }
        setStep(2);
      } else if (step === 2) {
        const res = await register({
          username, email, password, bio, games, platforms, playstyle, availabilities, relation_mode: relationMode
        });
        if (res?.error) setError(res.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1a102e_0%,_#0a0a0a_100%)] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className="w-full max-w-md bg-[#0E0E0E] border border-[#2A2A2A] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Gamepad2 className="w-64 h-64 text-[#7C3AED] transform rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DuoQ Logo" className="w-12 h-12 object-contain rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.4)]" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
              <div className="w-12 h-12 bg-[#7C3AED] rounded flex items-center justify-center font-black text-3xl text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hidden">
                Q
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mt-1 leading-none">
                DuoQ
              </h1>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6 border-b border-[#2A2A2A]">
            <button 
              onClick={() => { setView('login'); setStep(1); setError(''); }}
              className={`pb-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${view === 'login' ? 'text-white border-b-2 border-[#7C3AED]' : 'text-[#555] hover:text-[#888]'}`}
            >
              Se Connecter
            </button>
            <button 
              onClick={() => { setView('register'); setStep(1); setError(''); }}
              className={`pb-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${view === 'register' ? 'text-white border-b-2 border-[#7C3AED]' : 'text-[#555] hover:text-[#888]'}`}
            >
              S'inscrire
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {(view === 'login' || step === 1) ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-bold mb-2">Identifiants</h2>
                <p className="text-[#888] text-xs mb-6">
                  {view === 'login' ? 'Connecte-toi pour retrouver tes matchs.' : 'Crée ton profil gamer pour commencer à matcher.'}
                </p>
                
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={view === 'login' ? "Pseudo IG ou Email" : "Pseudo IG"}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] transition-all font-mono text-sm"
                    required
                  />
                  {view === 'register' && (
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Adresse Email"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] transition-all font-mono text-sm"
                      required
                    />
                  )}
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] transition-all font-mono text-sm"
                    required
                  />
                  
                  {view === 'register' && (
                    <label className="flex items-center gap-3 mt-4 pt-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAdult}
                        onChange={(e) => setIsAdult(e.target.checked)}
                        className="w-5 h-5 rounded border-[#333] bg-[#1A1A1A] text-[#7C3AED] focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs text-[#888] leading-tight">Je certifie avoir plus de 18 ans et je consens aux termes concernant mes données.</span>
                    </label>
                  )}
                </div>
                
                <button 
                  type="submit"
                  disabled={!username.trim() || !password.trim() || (view === 'register' && !email.trim())}
                  className="w-full mt-6 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:bg-[#333] text-white rounded-lg py-3 px-4 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {view === 'login' ? 'Connexion' : 'Continuer'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                <h2 className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-bold mb-4">Configure ton profil gamer</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Bio</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Comment tu tryhard ou tu chill..."
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] resize-none h-20 text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Jeux favoris</label>
                    <input 
                      type="text" 
                      value={games}
                      onChange={(e) => setGames(e.target.value)}
                      placeholder="Ex: Valorant, LoL, Elden Ring"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Plateformes</label>
                    <input 
                      type="text" 
                      value={platforms}
                      onChange={(e) => setPlatforms(e.target.value)}
                      placeholder="Ex: PC, PS5, Xbox Series, Switch"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Style de jeu</label>
                    <input 
                      type="text" 
                      value={playstyle}
                      onChange={(e) => setPlaystyle(e.target.value)}
                      placeholder="Ex: Tryharder, Chill"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Disponibilités</label>
                    <input 
                      type="text" 
                      value={availabilities}
                      onChange={(e) => setAvailabilities(e.target.value)}
                      placeholder="Ex: Soir et WE"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Mode (Intention)</label>
                  <div className="space-y-2">
                    {RELATION_MODES.map(mode => (
                      <label key={mode.id} className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${relationMode === mode.id ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-white' : 'bg-[#1A1A1A] border-[#333] text-[#888] hover:border-[#444]'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="relationMode" 
                            value={mode.id} 
                            checked={relationMode === mode.id}
                            onChange={() => setRelationMode(mode.id)}
                            className="sr-only"
                          />
                          <span className="text-lg w-8 text-center">{mode.id.split(' ')[0]}</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{mode.label.split(' (')[0]}</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-70">
                              {mode.label.split('(')[1]?.replace(')', '')}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-[#1A1A1A] border border-[#333] hover:bg-[#222] text-[#888] rounded-lg py-3 px-4 text-[10px] uppercase font-bold tracking-widest transition-all"
                  >
                    Retour
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg py-3 px-4 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    Start Game
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
