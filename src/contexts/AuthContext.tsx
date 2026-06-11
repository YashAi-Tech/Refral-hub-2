import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, increment, getDocFromServer, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate Connection to Firestore as per skill mandate
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userPath = `users/${user.uid}`;
        try {
          // Sync profile
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          if (!userSnap.exists()) {
            // Create new profile
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              referralCode,
              clicks: 0,
              conversions: 0,
              rewards: 0,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);

            // Handle pending referral if exists in localStorage
            const pendingReferrerUid = localStorage.getItem('referrerUid');
            if (pendingReferrerUid && pendingReferrerUid !== user.uid) {
              try {
                // Verify referrer exists and then update
                const referrerRef = doc(db, 'users', pendingReferrerUid);
                const referrerSnap = await getDoc(referrerRef);
                
                if (referrerSnap.exists()) {
                  const batch = writeBatch(db);
                  
                  const referralRef = doc(db, 'referrals', `${pendingReferrerUid}_${user.uid}`);
                  batch.set(referralRef, {
                    referrerUid: pendingReferrerUid,
                    referredUid: user.uid,
                    timestamp: serverTimestamp(),
                  });
                  
                  // Reward referrer: +1 conversion, +$5.00 reward
                  batch.update(referrerRef, {
                    conversions: increment(1),
                    rewards: increment(5.00)
                  });
                  
                  await batch.commit();
                }
              } catch (err) {
                console.error('Failed to reward referrer:', err);
              }
              localStorage.removeItem('referrerUid');
            }
          } else {
            setProfile(userSnap.data() as UserProfile);
          }

          // Listen for live updates
          const unsubProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setProfile(doc.data() as UserProfile);
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, userPath);
          });
          return () => unsubProfile();
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, userPath);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Use browserPopupRedirectResolver to improve iframe popup stability
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (err: any) {
      console.error('Sign in error:', err);
      // Handle the "cancelled-popup-request" and other errors gracefully
      if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign in process was interrupted. Please try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // Safe to ignore or show subtle message
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'An unexpected error occurred during sign in.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSigningIn, error, signIn, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
