import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Match, User } from '../types';
import { Gamepad2, AlertCircle } from 'lucide-react';
import { collection, query, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface MatchesProps {
  onSelectMatch: (match: Match) => void;
}

export function Matches({ onSelectMatch }: MatchesProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      // Due to indexes, it's easier to fetch all matches and filter for prototype, 
      // or we can do 2 queries (user1Id == me, user2Id == me).
      const matchesRef = collection(db, 'matches');
      const allMatches = await getDocs(matchesRef);
      
      const myMatches: any[] = [];
      allMatches.docs.forEach(doc => {
        const data = doc.data();
        if (data.user1Id === user!.id || data.user2Id === user!.id) {
          myMatches.push(data);
        }
      });
      
      // Populate opponent detail
      const populated = await Promise.all(myMatches.map(async (m) => {
        const opponentId = m.user1Id === user!.id ? m.user2Id : m.user1Id;
        const opDoc = await getDoc(doc(db, 'users', opponentId));
        const op = opDoc.exists() ? (opDoc.data() as User) : null;
        
        return {
          match_id: m.id,
          user_id: opponentId,
          username: op?.username || 'Unknown',
          bio: op?.bio || '',
          games: op?.games || '',
          platforms: op?.platforms || '',
          playstyle: op?.playstyle || '',
          availabilities: op?.availabilities || '',
          relation_mode: op?.relation_mode || 'Casual',
          discord_username: op?.discord_username || '',
          created_at: new Date(m.createdAt).toISOString()
        } as Match;
      }));
      
      setMatches(populated);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-6"><div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (matches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0A]">
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
    <div className="flex-1 flex flex-col p-8 animate-in fade-in bg-[#0A0A0A]">
      <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-8 border-b-2 border-[#2A2A2A] pb-2">Lobbies</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <button 
            key={match.match_id}
            onClick={() => onSelectMatch(match)}
            className="flex items-center text-left bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#7C3AED] hover:bg-[#1A1A1A] transition-all group"
          >
            <div className="w-14 h-14 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center mr-4 text-2xl group-hover:scale-110 transition-transform">
              {match.relation_mode.split(' ')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white truncate">{match.username}</h3>
              <p className="text-[10px] text-[#888] uppercase font-bold tracking-widest truncate mt-1">{match.games || 'Gamer'}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
