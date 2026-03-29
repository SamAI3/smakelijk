import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Household } from '../types';
import { useAuth } from './AuthContext';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

interface HouseholdContextType {
  household: Household | null;
  loading: boolean;
  createHousehold: (naam: string) => Promise<void>;
  joinHousehold: (code: string) => Promise<boolean>;
  refreshHousehold: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | null>(null);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHousehold = async (uid: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'households'), where('leden', 'array-contains', uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        setHousehold({
          id: d.id,
          naam: data.naam,
          code: data.code,
          leden: data.leden,
          aangemaakt: data.aangemaakt?.toDate() ?? new Date(),
        });
      } else {
        setHousehold(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHousehold(user.uid);
    } else {
      setHousehold(null);
      setLoading(false);
    }
  }, [user]);

  const createHousehold = async (naam: string) => {
    if (!user) return;
    const code = generateCode();
    const ref = doc(collection(db, 'households'));
    await setDoc(ref, {
      naam,
      code,
      leden: [user.uid],
      aangemaakt: serverTimestamp(),
    });
    await loadHousehold(user.uid);
  };

  const joinHousehold = async (code: string): Promise<boolean> => {
    if (!user) return false;
    console.log('[joinHousehold] searching for code:', code.toUpperCase());
    const q = query(collection(db, 'households'), where('code', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    console.log('[joinHousehold] results:', snap.size);
    if (snap.empty) return false;
    const d = snap.docs[0];
    const current: string[] = d.data().leden ?? [];
    if (!current.includes(user.uid)) {
      await updateDoc(doc(db, 'households', d.id), {
        leden: [...current, user.uid],
      });
    }
    await loadHousehold(user.uid);
    return true;
  };

  const refreshHousehold = async () => {
    if (user) await loadHousehold(user.uid);
  };

  return (
    <HouseholdContext.Provider value={{ household, loading, createHousehold, joinHousehold, refreshHousehold }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider');
  return ctx;
}
