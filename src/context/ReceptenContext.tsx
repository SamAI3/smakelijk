import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Recept, Weekkeuze } from '../types';
import {
  subscribeRecepten, subscribeWeekkeuze,
  addRecept, updateRecept, deleteRecept,
  addToWeekkeuze, updateWeekkeuze, deleteFromWeekkeuze, clearWeekkeuze
} from '../services/recepten';
import { useHousehold } from './HouseholdContext';
import { useAuth } from './AuthContext';

interface ReceptenContextType {
  recepten: Recept[];
  weekkeuze: Weekkeuze[];
  loading: boolean;
  addRecept: (recept: Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor'>) => Promise<string>;
  updateRecept: (id: string, data: Partial<Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor'>>) => Promise<void>;
  deleteRecept: (id: string) => Promise<void>;
  addToWeekkeuze: (receptId: string, porties: number) => Promise<void>;
  updateWeekkeuze: (id: string, porties: number) => Promise<void>;
  removeFromWeekkeuze: (id: string) => Promise<void>;
  clearWeekkeuze: () => Promise<void>;
}

const ReceptenContext = createContext<ReceptenContextType | null>(null);

export function ReceptenProvider({ children }: { children: ReactNode }) {
  const { household } = useHousehold();
  const { user } = useAuth();
  const [recepten, setRecepten] = useState<Recept[]>([]);
  const [weekkeuze, setWeekkeuze] = useState<Weekkeuze[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!household) {
      setRecepten([]);
      setWeekkeuze([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub1 = subscribeRecepten(household.id, (data) => {
      setRecepten(data);
      setLoading(false);
    });
    const unsub2 = subscribeWeekkeuze(household.id, setWeekkeuze);
    return () => { unsub1(); unsub2(); };
  }, [household]);

  const hid = household?.id ?? '';
  const uid = user?.uid ?? '';

  return (
    <ReceptenContext.Provider value={{
      recepten,
      weekkeuze,
      loading,
      addRecept: (r) => addRecept(hid, r, uid),
      updateRecept: (id, d) => updateRecept(hid, id, d),
      deleteRecept: (id) => deleteRecept(hid, id),
      addToWeekkeuze: (rId, p) => addToWeekkeuze(hid, rId, p),
      updateWeekkeuze: (id, p) => updateWeekkeuze(hid, id, p),
      removeFromWeekkeuze: (id) => deleteFromWeekkeuze(hid, id),
      clearWeekkeuze: () => clearWeekkeuze(hid, weekkeuze.map((w) => w.id)),
    }}>
      {children}
    </ReceptenContext.Provider>
  );
}

export function useRecepten() {
  const ctx = useContext(ReceptenContext);
  if (!ctx) throw new Error('useRecepten must be used within ReceptenProvider');
  return ctx;
}
