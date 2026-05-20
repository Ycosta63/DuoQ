import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from './types';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: User | null;
  login: (emailOrUsername: string, password?: string) => Promise<{error?: string}>;
  register: (data: Partial<User> & { password?: string }) => Promise<{error?: string}>;
  updateProfile: (data: Partial<User>) => Promise<{error?: string}>;
  deleteAccount: () => Promise<{error?: string}>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedId = localStorage.getItem('duoq_user_id');
      if (storedId) {
        try {
          const docRef = doc(db, 'users', storedId);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User);
          } else {
             localStorage.removeItem('duoq_user_id');
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (emailOrUsername: string, password?: string) => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      let q = query(collection(db, 'users'), where('username', '==', emailOrUsername));
      let querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        q = query(collection(db, 'users'), where('email', '==', emailOrUsername));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        // Fallback for existing unhashed passwords (in a real app, force reset, but here we can just do a basic check or just use bcrypt.compareSync)
        let isValid = false;
        try {
          isValid = bcrypt.compareSync(password || '', userData.password || '');
        } catch(e) {
          // Ignore
        }
        
        // Fallback for existing plaintext accounts
        if (!isValid && userData.password === password) {
          isValid = true;
        }

        if (isValid) {
          const u = { id: userDoc.id, ...userData } as User;
          setUser(u);
          localStorage.setItem('duoq_user_id', u.id);
          return {};
        } else {
          return { error: 'Identifiants invalides.' };
        }
      }
      
      return { error: 'Profil introuvable.' };
    } catch (e: any) {
      console.error(e);
      return { error: 'Erreur technique' };
    }
  };

  const register = async (data: Partial<User> & { password?: string }) => {
    try {
      if (!data.password) throw new Error("Mot de passe requis");
      if (!data.username) throw new Error("Pseudo requis");
      if (!data.email) throw new Error("Email requis");
      
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      // Check username
      let q = query(collection(db, 'users'), where('username', '==', data.username));
      let querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { error: 'Ce pseudo est déjà pris.' };
      }
      
      // Check email
      q = query(collection(db, 'users'), where('email', '==', data.email));
      querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { error: 'Cet email est déjà utilisé.' };
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(data.password, salt);

      const newId = uuidv4();
      const newUser: any = {
        id: newId,
        email: data.email,
        username: data.username,
        password: hashedPassword,
        bio: data.bio || '',
        games: data.games || '',
        platforms: data.platforms || '',
        playstyle: data.playstyle || '',
        availabilities: data.availabilities || '',
        discord_username: data.discord_username || '',
        relation_mode: data.relation_mode || 'Casual',
        questionnaire: data.questionnaire || {}
      };

      await setDoc(doc(db, 'users', newId), newUser);
      
      setUser(newUser);
      localStorage.setItem('duoq_user_id', newId);
      
      return {};
    } catch (e: any) {
      console.error(e);
      return { error: "Erreur lors de la création du compte." };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { error: 'Non authentifié' };
    try {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', user.id), { ...data });
      setUser({ ...user, ...data });
      return {};
    } catch (e) {
      console.error(e);
      return { error: 'Erreur lors de la mise à jour' };
    }
  };

  const deleteAccount = async () => {
    if (!user) return { error: 'Non authentifié' };
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', user.id));
      setUser(null);
      localStorage.removeItem('duoq_user_id');
      return {};
    } catch (e) {
      console.error(e);
      return { error: 'Erreur lors de la suppression' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('duoq_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, deleteAccount, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
