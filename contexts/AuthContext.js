'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';

const AuthContext = createContext();

async function syncProfile(token) {
  const res = await fetch('/api/auth/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Sync failed' }));
    throw new Error(errorData.message || 'Failed to sync user');
  }

  const data = await res.json();
  return data.user;
}

export default function AuthProvider({ children }) {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setToken(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        const profileData = await syncProfile(idToken);
        setUser(firebaseUser);
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error('Auth sync failed', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [auth]);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    [auth]
  );

  const register = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    [auth]
  );

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [auth]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    setProfile(null);
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, token, profile, loading, error, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
