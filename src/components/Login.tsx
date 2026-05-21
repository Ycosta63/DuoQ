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
  const [gender, setGender] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Questionnaire elements
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('');
  const [q5, setQ5] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (view === 'login') {
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
        setStep(3);
      } else if (step === 3) {
        const res = await register({
          username, email, password, bio, games, platforms, playstyle, availabilities, relation_mode: relationMode,
          gender, avatar_url: avatarUrl,
          questionnaire: {
            q1, q2, q3, q4, q5
          }
        });
        if (res?.error) setError(res.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Deep Space Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,_#1c103f_0%,_#000000_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#7C3AED]/10 to-transparent"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
      </div>
      <div className="w-full max-w-md bg-[#0E0E0E]/95 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden z-10">
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
            ) : step === 2 ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                <h2 className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-bold mb-4">Configure ton profil gamer</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Avatar (URL de l'image ou PP Discord)</label>
                    <input 
                      type="url" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://... (Lien vers une image ou avatar Discord)"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Genre / Pronoms</label>
                    <input 
                      type="text" 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      placeholder="Ex: Homme, Femme, Non-binaire, Il/Lui, Elle, etc."
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                  </div>

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
                      list="games-list"
                      value={games}
                      onChange={(e) => setGames(e.target.value)}
                      placeholder="Ex: Valorant, LoL, Elden Ring"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                    <datalist id="games-list">
                      <option value="League of Legends" />
                      <option value="Valorant" />
                      <option value="Overwatch 2" />
                      <option value="Elden Ring" />
                      <option value="CS2" />
                      <option value="Apex Legends" />
                      <option value="Minecraft" />
                      <option value="Fortnite" />
                      <option value="World of Warcraft" />
                      <option value="Rocket League" />
                    </datalist>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Plateformes</label>
                    <input 
                      type="text" 
                      list="platforms-list"
                      value={platforms}
                      onChange={(e) => setPlatforms(e.target.value)}
                      placeholder="Ex: PC, PS5, Xbox Series, Switch"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                    />
                    <datalist id="platforms-list">
                      <option value="PC" />
                      <option value="PS5" />
                      <option value="PS4" />
                      <option value="Xbox Series X/S" />
                      <option value="Xbox One" />
                      <option value="Nintendo Switch" />
                      <option value="Mobile" />
                    </datalist>
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
                    Continuer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                <h2 className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-bold mb-4">Questionnaire de Match</h2>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">1. Quel type de coéquipier es-tu in-game ?</label>
                    <textarea 
                      value={q1}
                      onChange={(e) => setQ1(e.target.value)}
                      placeholder="Leader, chill, support..."
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] resize-none h-16 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">2. Ta réaction quand un mate feed ?</label>
                    <textarea 
                      value={q2}
                      onChange={(e) => setQ2(e.target.value)}
                      placeholder="Je l'insulte (non je rigole), je l'encourage..."
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] resize-none h-16 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">3. Que cherches-tu idéalement chez ton/ta Duo ?</label>
                    <textarea 
                      value={q3}
                      onChange={(e) => setQ3(e.target.value)}
                      placeholder="De la bonne humeur, du niveau, quelqu'un qui carry..."
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] resize-none h-16 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">4. Plutôt vocal h24 ou full sans micro ?</label>
                    <textarea 
                      value={q4}
                      onChange={(e) => setQ4(e.target.value)}
                      placeholder="Discord obligatoire, chill en musique, ping seulement..."
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] resize-none h-16 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">5. Ton moment préféré / plus grand exploit ?</label>
                    <textarea 
                      value={q5}
                      onChange={(e) => setQ5(e.target.value)}
                      placeholder="Avoir atteint le rang Master, finir un jeu souls-like, une soirée inoubliable..."
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] resize-none h-16 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
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
