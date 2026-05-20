import { useState } from 'react';
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
  
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const res = await updateProfile({ bio, games, platforms, playstyle, availabilities, discord_username: discordUsername, relation_mode: relationMode });
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
              <label className="text-xs uppercase tracking-widest font-semibold text-[#5865F2] mb-2 flex items-center gap-2">
                Tag Discord (Optionnel)
              </label>
              <input 
                type="text" 
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="Ex: pseudo#1234 ou pseudo"
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-all text-sm font-mono"
              />
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
