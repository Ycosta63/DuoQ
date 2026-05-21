import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const RELATION_MODES = [
  { id: '🎮 Manette', label: 'Manette (Relation sérieuse)' },
  { id: '🕹️ Joystick', label: 'Joystick (Relation décontractée / Co-op)' },
  { id: '👾 Alien Pixel', label: "Alien Pixel (Plan d'un soir)" },
  { id: '🖥️ PC', label: 'PC (Tryhard / Compétitif)' }
];

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { user, updateProfile, deleteAccount } = useAuth();
  
  const [bio, setBio] = useState(user?.bio || '');
  const [games, setGames] = useState(user?.games || '');
  const [platforms, setPlatforms] = useState(user?.platforms || '');
  const [playstyle, setPlaystyle] = useState(user?.playstyle || '');
  const [availabilities, setAvailabilities] = useState(user?.availabilities || '');
  const [discordUsername, setDiscordUsername] = useState(user?.discord_username || '');
  const [relationMode, setRelationMode] = useState(user?.relation_mode || RELATION_MODES[0].id);
  const [gender, setGender] = useState(user?.gender || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [q1, setQ1] = useState(user?.questionnaire?.q1 || '');
  const [q2, setQ2] = useState(user?.questionnaire?.q2 || '');
  const [q3, setQ3] = useState(user?.questionnaire?.q3 || '');
  const [q4, setQ4] = useState(user?.questionnaire?.q4 || '');
  const [q5, setQ5] = useState(user?.questionnaire?.q5 || '');
  
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateTestUsers = async () => {
    setGenerating(true);
    setMsg('');
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const { v4: uuidv4 } = await import('uuid');
      const bcrypt = await import('bcryptjs');

      const testUsers = [
        {
          username: "FakerBot",
          bio: "Je joue que pour la gagne. Si tu troll tu dégages.",
          games: "League of Legends, Valorant",
          platforms: "PC",
          playstyle: "Tryhard",
          availabilities: "Tous les soirs",
          relation_mode: "🖥️ PC",
          gender: "Homme",
          avatar_url: "https://i.pravatar.cc/150?img=11",
          questionnaire: {
            q1: "Leader, je call toujours les objectifs.",
            q2: "Je dis rien mais je le juge fort.",
            q3: "Quelqu'un qui sait écouter mes calls.",
            q4: "Vocal obligatoire, sinon pas la peine.",
            q5: "Mon premier passage Challenger."
          }
        },
        {
          username: "ChillGirl99",
          bio: "Juste là pour m'amuser et rencontrer des gens sympas.",
          games: "Minecraft, Stardew Valley, Animal Crossing",
          platforms: "PC, Nintendo Switch",
          playstyle: "Chill",
          availabilities: "Week-ends uniquement",
          relation_mode: "🕹️ Joystick",
          gender: "Femme",
          avatar_url: "https://i.pravatar.cc/150?img=5",
          questionnaire: {
            q1: "Très chill, je fais ma vie.",
            q2: "C'est pas grave, c'est qu'un jeu haha.",
            q3: "Quelqu'un avec qui on rigole beaucoup.",
            q4: "Vocal avec musique de fond, au calme.",
            q5: "Avoir fini ma ferme sur Stardew."
          }
        },
        {
          username: "xXSniperXx",
          bio: "Rush B don't stop. J'ai un aim bot naturel.",
          games: "CS2, Apex Legends, Call of Duty",
          platforms: "PC, PS5",
          playstyle: "Agressif",
          availabilities: "Après-midi et soirs",
          relation_mode: "🖥️ PC",
          gender: "Homme",
          avatar_url: "https://i.pravatar.cc/150?img=33",
          questionnaire: {
            q1: "Toujours en tête, je prends les duels.",
            q2: "Je râle un peu si c'est de la ranked.",
            q3: "Un mec qui sait tenir sa ligne.",
            q4: "Ping seulement ou infos ultra rapides, pas de blabla.",
            q5: "Mon clutch 1v5 hier."
          }
        },
        {
          username: "EldenLord",
          bio: "Je préfère esquiver et parer plutôt que parler.",
          games: "Elden Ring, Dark Souls, Monster Hunter",
          platforms: "PC, PS5",
          playstyle: "Explorateur, Persévérant",
          availabilities: "La nuit",
          relation_mode: "🎮 Manette",
          gender: "Non-binaire",
          avatar_url: "https://i.pravatar.cc/150?img=9",
          questionnaire: {
            q1: "Je tank, je prends les coups.",
            q2: "On réessaie le boss, c'est tout.",
            q3: "La patience et la détermination.",
            q4: "Micro facultatif, ça déconcentre pendant les boss.",
            q5: "Avoir battu Malenia sans invocation."
          }
        },
        {
          username: "PocketHealer",
          bio: "Support main à votre service.",
          games: "Overwatch 2, Final Fantasy XIV",
          platforms: "PC",
          playstyle: "Support",
          availabilities: "Matin et soir",
          relation_mode: "🎮 Manette",
          gender: "Femme",
          avatar_url: "https://i.pravatar.cc/150?img=43",
          questionnaire: {
            q1: "Support pur, je garde tout le monde en vie.",
            q2: "J'essaie de le heal plus, mais s'il court seul...",
            q3: "Un tank ou DPS qui sait protéger son heal.",
            q4: "Vocal pour annoncer où est l'équipe adverse.",
            q5: "Résurrection de 5 personnes (rip l'ancien temps)."
          }
        }
      ];

      let cnt = 0;
      for (const u of testUsers) {
        const newId = uuidv4();
        const salt = bcrypt.default.genSaltSync(10);
        const hashedPassword = bcrypt.default.hashSync("test1234", salt);

        await setDoc(doc(db, 'users', newId), {
          id: newId,
          email: `${u.username.toLowerCase()}@test.com`,
          username: u.username,
          password: hashedPassword,
          bio: u.bio,
          games: u.games,
          platforms: u.platforms,
          playstyle: u.playstyle,
          availabilities: u.availabilities,
          discord_username: "",
          relation_mode: u.relation_mode,
          gender: u.gender,
          avatar_url: u.avatar_url,
          questionnaire: u.questionnaire || {}
        });
        cnt++;
      }
      setMsg(`${cnt} comptes générés avec succès !`);
    } catch (e: any) {
      console.error(e);
      setMsg("Erreur lors de la génération.");
    }
    setGenerating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const res = await updateProfile({ 
      bio, games, platforms, playstyle, availabilities, 
      discord_username: discordUsername, relation_mode: relationMode, 
      gender, avatar_url: avatarUrl,
      questionnaire: { q1, q2, q3, q4, q5 }
    });
    setSaving(false);
    if (res.error) {
      setMsg(res.error);
    } else {
      setMsg('Profil mis à jour !');
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte et toutes vos données ? (Action irréversible)")) {
      await deleteAccount();
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DISCORD_AUTH_SUCCESS' && event.data.discord_username) {
        setDiscordUsername(event.data.discord_username);
        setMsg('Compte Discord lié avec succès ! N\'oubliez pas d\'enregistrer.');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectDiscord = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await fetch(`/api/auth/discord/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) throw new Error('Erreur configuration Discord');
      const { url } = await response.json();
      
      const authWindow = window.open(url, 'discord_oauth', 'width=600,height=700');
      if (!authWindow) alert('Veuillez autoriser les popups pour lier votre compte Discord.');
    } catch (e) {
      console.error(e);
      setMsg('Erreur lors de la liaison Discord.');
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-10 overflow-y-auto custom-scrollbar w-full">
      <div className="w-full max-w-3xl bg-[#0E0E0E]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl relative mb-10">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 rounded-xl bg-black/50 border border-white/10 hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        <div className="text-center mb-10 pt-4">
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-md text-white">Paramètres</h2>
          <p className="text-[#888] text-sm uppercase tracking-widest font-bold">Gérez vos informations & préférences de match.</p>
        </div>

        {msg && (
          <div className={`mb-6 p-3 rounded-lg text-xs font-bold uppercase tracking-widest text-center ${msg === 'Profil mis à jour !' ? 'bg-green-500/10 border border-green-500/50 text-green-500' : 'bg-red-500/10 border border-red-500/50 text-red-500'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
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
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] resize-none h-24 text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Jeux favoris</label>
              <input 
                type="text" 
                value={games}
                onChange={(e) => setGames(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Plateformes</label>
              <input 
                type="text" 
                value={platforms}
                onChange={(e) => setPlatforms(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Style de jeu</label>
              <input 
                type="text" 
                value={playstyle}
                onChange={(e) => setPlaystyle(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Disponibilités</label>
              <input 
                type="text" 
                value={availabilities}
                onChange={(e) => setAvailabilities(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Tag Discord (Optionnel)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  placeholder="Ex: pseudo#1234 ou pseudo"
                  className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-all text-sm font-mono"
                />
                <button 
                  type="button" 
                  onClick={handleConnectDiscord}
                  className="px-4 py-3 bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/30 hover:bg-[#5865F2] hover:text-white rounded-xl text-xs uppercase font-bold tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Lier
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">Mode (Intention)</label>
              <div className="grid grid-cols-2 gap-2">
                {RELATION_MODES.map(mode => (
                  <label key={mode.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${relationMode === mode.id ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-white' : 'bg-[#1A1A1A] border-[#333] text-[#888] hover:border-[#444]'}`}>
                    <input 
                      type="radio" 
                      name="relationMode" 
                      value={mode.id} 
                      checked={relationMode === mode.id}
                      onChange={() => setRelationMode(mode.id)}
                      className="sr-only"
                    />
                    <span className="text-lg w-8">{mode.id.split(' ')[0]}</span>
                    <span className="text-xs font-bold leading-tight">{mode.label.split(' (')[0]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2 mt-8 mb-4">
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-[#7C3AED] drop-shadow-md">Questionnaire de Match</h3>
              <p className="text-[#888] text-xs uppercase tracking-widest font-bold mb-4">Ces réponses seront visibles sur votre profil par vos matchs.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">1. Quel type de coéquipier es-tu in-game ?</label>
                  <input 
                    type="text" 
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">2. Ta réaction quand un mate feed ?</label>
                  <input 
                    type="text" 
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">3. Que cherches-tu idéalement chez ton/ta Duo ?</label>
                  <input 
                    type="text" 
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">4. Plutôt vocal h24 ou sans micro / ping uniquement ?</label>
                  <input 
                    type="text" 
                    value={q4}
                    onChange={(e) => setQ4(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#888] mb-2 block">5. Ton moment préféré ou plus grand accomplissement gaming ?</label>
                  <input 
                    type="text" 
                    value={q5}
                    onChange={(e) => setQ5(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2A2A2A] flex flex-col sm:flex-row justify-between items-center gap-4">
            <button 
              type="button"
              onClick={generateTestUsers}
              disabled={generating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/30 rounded-xl text-xs uppercase font-bold tracking-widest transition-all"
            >
              🛠️ {generating ? 'Génération...' : 'Générer comptes test'}
            </button>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <button 
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-xl text-xs uppercase font-bold tracking-widest transition-all"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white rounded-xl text-xs uppercase font-bold tracking-widest transition-all shadow-lg active:scale-95"
              >
                <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
