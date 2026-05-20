export interface User {
  id: string;
  email: string;
  username: string;
  bio: string;
  games: string;
  platforms: string;
  playstyle: string;
  availabilities: string;
  relation_mode: string; // '🎮 Manette à deux', '🕹️ Co-op story', '🖥️ PC', '🎯 One-shot'
  discord_username?: string;
  is_premium?: number;
  questionnaire?: Record<string, string>;
}

export interface Match {
  match_id: string;
  id: string; // The other user's ID
  user_id?: string;
  username: string;
  bio: string;
  games: string;
  platforms?: string;
  playstyle: string;
  availabilities?: string;
  relation_mode: string;
  discord_username?: string;
  created_at?: string;
  questionnaire?: Record<string, string>;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
