import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Match, Message } from '../types';
import { ArrowLeft, Send, Gamepad2, Info, MessageSquare } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, setDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ChatProps {
  match: Match;
  onBack: () => void;
}

export function Chat({ match, onBack }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Clear unread flag when viewing
    try {
      updateDoc(doc(db, 'matches', match.match_id), {
        [`unreadBy_${user.id}`]: false
      });
    } catch(e) {}
    
    const messagesRef = collection(db, 'matches', match.match_id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: data.id,
          match_id: data.matchId,
          sender_id: data.senderId,
          content: data.content,
          created_at: new Date(data.createdAt).toISOString()
        });
      });
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [match.match_id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const content = newMessage;
    setNewMessage('');
    
    try {
      const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      const messagesRef = collection(db, 'matches', match.match_id, 'messages');
      await setDoc(doc(messagesRef, messageId), {
        id: messageId,
        matchId: match.match_id,
        senderId: user.id,
        content,
        createdAt: Date.now()
      });
      
      const opponentId = match.user_id;
      try {
        await updateDoc(doc(db, 'matches', match.match_id), {
          lastMessage: {
            content,
            senderId: user.id,
            createdAt: Date.now()
          },
          [`unreadBy_${opponentId}`]: true
        });
      } catch (e) {
        console.error(e);
      }
    } catch(e) {
      console.error("Error sending message:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full absolute inset-0 animate-in slide-in-from-right-8 duration-300">
      <header className="px-4 py-3 border-b border-[#2A2A2A] bg-[#0E0E0E] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-[#1A1A1A] text-[#888] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center text-lg">
              {match.relation_mode.split(' ')[0]}
            </div>
            <div>
              <h2 className="font-black italic uppercase tracking-tighter text-white leading-tight">{match.username}</h2>
              <p className="text-[10px] text-[#888] font-bold uppercase tracking-widest truncate max-w-[150px]">{match.games.split(',')[0] || 'Gamer'} Main</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowProfile(!showProfile)}
          className={`p-2 rounded-full transition-colors ${showProfile ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-[#1A1A1A] text-[#888] hover:text-white'}`}
          title="Voir le profil complet"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      {/* Profil complet révélé */}
      {showProfile && (
        <div className="p-6 bg-[#0E0E0E] border-b border-[#2A2A2A] animate-in slide-in-from-top-2">
          <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
            <div className="flex items-center gap-2 text-[#7C3AED] text-[10px] font-bold uppercase tracking-widest mb-4">
              <Gamepad2 className="w-4 h-4" /> Profil Débloqué
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-[#555] block text-[10px] uppercase tracking-widest font-bold mb-1">Bio</span>
                <p className="text-white">{match.bio || <span className="text-[#555] font-mono italic">Not provided</span>}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#555] block text-[10px] uppercase tracking-widest font-bold mb-1">Jeux</span>
                  <p className="text-white font-mono">{match.games || '-'}</p>
                </div>
                <div>
                  <span className="text-[#555] block text-[10px] uppercase tracking-widest font-bold mb-1">Style</span>
                  <p className="text-white font-mono">{match.playstyle || '-'}</p>
                </div>
                <div>
                  <span className="text-[#555] block text-[10px] uppercase tracking-widest font-bold mb-1">Plateformes</span>
                  <p className="text-white font-mono">{match.platforms || '-'}</p>
                </div>
                <div>
                  <span className="text-[#555] block text-[10px] uppercase tracking-widest font-bold mb-1">Disponibilités</span>
                  <p className="text-white font-mono">{match.availabilities || '-'}</p>
                </div>
                {match.discord_username && (
                  <div className="col-span-2 mt-2 p-3 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl relative overflow-hidden group">
                    <span className="text-[#5865F2] block text-[10px] uppercase tracking-widest font-bold mb-1">Tag Discord</span>
                    <p className="text-white font-mono flex items-center justify-between">
                      {match.discord_username}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(match.discord_username!);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`text-xs text-white px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-all ${copied ? 'bg-green-500 opacity-100' : 'bg-[#5865F2] opacity-0 group-hover:opacity-100'}`}
                      >
                        {copied ? 'Copié !' : 'Copier'}
                      </button>
                    </p>
                  </div>
                )}
              </div>
              
              {match.questionnaire && Object.keys(match.questionnaire).length > 0 && (
                <div className="pt-4 mt-4 border-t border-[#333]">
                  <span className="text-[#555] block text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Questionnaire de Match
                  </span>
                  <div className="space-y-3">
                    {match.questionnaire.q1 && (
                      <div>
                        <span className="text-[#888] block text-[10px] italic mb-1">Q: Plutôt tryhard en Ranked ou troll en Normal ?</span>
                        <p className="text-white text-sm bg-[#1A1A1A] p-2 rounded-lg border border-[#333]">{match.questionnaire.q1}</p>
                      </div>
                    )}
                    {match.questionnaire.q2 && (
                      <div>
                        <span className="text-[#888] block text-[10px] italic mb-1">Q: Micro actif obligatoire en game ?</span>
                        <p className="text-white text-sm bg-[#1A1A1A] p-2 rounded-lg border border-[#333]">{match.questionnaire.q2}</p>
                      </div>
                    )}
                    {match.questionnaire.q3 && (
                      <div>
                        <span className="text-[#888] block text-[10px] italic mb-1">Q: Ton meilleur souvenir gaming ?</span>
                        <p className="text-white text-sm bg-[#1A1A1A] p-2 rounded-lg border border-[#333]">{match.questionnaire.q3}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-4 mt-4 border-t border-[#333]">
                <span className="text-[#555] block text-[10px] uppercase tracking-widest font-bold mb-2">Connect to Play</span>
                <a 
                  href="https://discord.com/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg py-3 px-4 font-bold flex items-center justify-center gap-2 transition-colors text-[10px] uppercase tracking-widest"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ouvrir Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-3">
              <Gamepad2 className="w-6 h-6 text-[#555]" />
            </div>
            <p className="text-[#888] font-bold text-xs uppercase tracking-widest">Envoyez le premier message à {match.username} !</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === user!.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    isMe 
                      ? 'bg-[#7C3AED] text-white rounded-br-sm font-medium' 
                      : 'bg-[#1A1A1A] text-white rounded-bl-sm border border-[#333] font-medium'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0E0E0E] border-t border-[#2A2A2A]">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-full px-5 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#7C3AED] transition-colors text-sm font-medium"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:bg-[#333] transition-colors shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
