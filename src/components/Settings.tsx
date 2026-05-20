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
  
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const res = await updateProfile({ bio, games, platforms, playstyle, availabilities, discord_username: discordUsername, relation_mode: relationMode, gender, avatar_url: avatarUrl });
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0E0E0E] border border-[#2A2A2A] rounded-3xl p-8 relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 rounded-xl bg-[#1A1A1A] border border-[#333] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        <div className="text-center mb-8 pt-4">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Paramètres (RGPD)</h2>
          <p className="text-[#888] text-sm">Gérez vos informations personnelles et vos préférences de match.</p>
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
          </div>

          <div className="pt-6 border-t border-[#2A2A2A] flex justify-between items-center">
            <button 
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-xl text-xs uppercase font-bold tracking-widest transition-all"
            >
              <Trash2 className="w-4 h-4" /> Supprimer mon compte
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-xl text-xs uppercase font-bold tracking-widest transition-all"
            >
              <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
