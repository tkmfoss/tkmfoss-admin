import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  isGuestAdmin: boolean;
  isLoading: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  enterGuestAdminMode: () => void;
  logout: () => Promise<void>;
  userDisplayName: string;
  userEmail: string;
  userPhoto: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuestAdmin, setIsGuestAdmin] = useState<boolean>(() => {
    return localStorage.getItem('tkmfoss_guest_admin') === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsGuestAdmin(false);
    localStorage.removeItem('tkmfoss_guest_admin');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    setIsGuestAdmin(false);
    localStorage.removeItem('tkmfoss_guest_admin');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const enterGuestAdminMode = () => {
    setIsGuestAdmin(true);
    localStorage.setItem('tkmfoss_guest_admin', 'true');
  };

  const logout = async () => {
    setIsGuestAdmin(false);
    localStorage.removeItem('tkmfoss_guest_admin');
    await fbSignOut(auth);
  };

  const userDisplayName = isGuestAdmin
    ? 'FOSS Lead Admin (Demo)'
    : user?.displayName || user?.email?.split('@')[0] || 'Admin';

  const userEmail = isGuestAdmin ? 'admin@foss.tkmce.ac.in' : user?.email || 'admin@foss.tkmce.ac.in';
  const userPhoto = user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuestAdmin,
        isLoading,
        loginWithEmail,
        loginWithGoogle,
        enterGuestAdminMode,
        logout,
        userDisplayName,
        userEmail,
        userPhoto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
