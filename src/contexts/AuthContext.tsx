import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Set persistence to LOCAL
        await setPersistence(auth, browserLocalPersistence);

        // Check for redirect result
        const result = await getRedirectResult(auth, browserPopupRedirectResolver);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    initAuth();
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      // Try popup first with explicit resolver
      try {
        const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
        if (!result.user) {
          throw new Error('No user data returned');
        }
      } catch (popupError: any) {
        // If popup fails (blocked or closed), fall back to redirect
        if (popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign-out error:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}