import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Match, User } from '../types';
import { Gamepad2 } from 'lucide-react';
import { collection, query, or, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface MatchesProps {
  onSelectMatch: (match: Match) => void;
}

export function Matches({ onSelectMatch }: MatchesProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<(Match & { unread?: boolean, lastMessage?: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, or(where('user1Id', '==', user.id), where('user2Id', '==', user.id)));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const myMatches: any[] = [];
      snapshot.forEach(d => {
        myMatches.push({ _internalId: d.id, ...d.data() });
      });

      const populated = await Promise.all(myMatches.map(async (m) => {
        const opponentId = m.user1Id === user.id ? m.user2Id : m.user1Id;
        const opDoc = await getDoc(doc(db, 'users', opponentId));
        const op = opDoc.exists() ? (opDoc.data() as User) : null;
        
        return {
          match_id: m._internalId,
          user_id: opponentId,
          username: op?.username || 'Unknown',
          bio: op?.bio || '',
          games: op?.games || '',
          platforms: op?.platforms || '',
          playstyle: op?.playstyle || '',
          availabilities: op?.availabilities || '',
          relation_mode: op?.relation_mode || 'Casual',
          questionnaire: op?.questionnaire,
          discord_username: op?.discord_username || '',
          unread: m[`unreadBy_${user.id}`] === true,
          lastMessage: m.lastMessage?.content || null,
          created_at: new Date(m.createdAt).toISOString()
        } as Match & { unread?: boolean; lastMessage?: string | null };
      }));

      // Filter out blocked users
      const blocked = user.blocked_users || [];
      const filtered = populated.filter(m => !blocked.includes(m.user_id!));

      // Sort by newest activity roughly
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setMatches(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-6"><div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (matches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mix-blend-screen">
        <div className="w-16 h-16 bg-[#0E0E0E] rounded-full flex items-center justify-center mb-4 border border-[#2A2A2A]">
          <Gamepad2 className="w-6 h-6 text-[#555]" />
        </div>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Aucun match pour le moment</h2>
        <p className="text-[#888] max-w-xs text-sm">
          Continuez à swiper (GG) pour trouver vos futurs partenaires de jeu.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-10 animate-in fade-in max-w-7xl mx-auto w-full">
      <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-8 drop-shadow-md">Vos Lobbies</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <button 
            key={match.match_id}
            onClick={() => onSelectMatch(match)}
            className="flex items-center text-left bg-[#0E0E0E]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/10 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 group relative overflow-hidden"
          >
            {match.unread && (
              <div className="absolute top-5 right-5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]"></div>
            )}
            <div className="w-14 h-14 bg-gradient-to-tr from-[#111] to-[#222] border border-white/10 shadow-inner rounded-full flex items-center justify-center mr-5 text-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              {match.relation_mode.split(' ')[0]}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3 className={`text-xl sm:text-2xl font-black italic uppercase tracking-tighter truncate leading-none ${match.unread ? 'text-white drop-shadow-sm' : 'text-[#DDD]'}`}>{match.username}</h3>
              {match.lastMessage ? (
                <p className={`text-xs top-1 truncate mt-1 sm:mt-1.5 ${match.unread ? 'text-white font-semibold' : 'text-[#888]'}`}>{match.lastMessage}</p>
              ) : (
                <p className="text-[9px] sm:text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest truncate mt-2">{match.games.split(',')[0] || 'Gamer'} Main</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
