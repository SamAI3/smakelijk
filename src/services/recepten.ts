import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy,
  Unsubscribe, DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';
import { Recept, Weekkeuze } from '../types';

function toRecept(id: string, data: DocumentData): Recept {
  return {
    id,
    titel: data.titel ?? '',
    type: data.type ?? 'hoofdgerecht',
    ingredienten: data.ingredienten ?? [],
    bereiding: data.bereiding ?? [],
    keuken: data.keuken ?? '',
    moeilijkheid: data.moeilijkheid ?? 'doordeweeks',
    bereidingstijd: data.bereidingstijd ?? 30,
    porties: data.porties ?? 4,
    tags: data.tags ?? [],
    notities: data.notities ?? '',
    bronUrl: data.bronUrl ?? '',
    favoriet: data.favoriet ?? false,
    aangemaakt: data.aangemaakt?.toDate() ?? new Date(),
    laatstGemaakt: data.laatstGemaakt?.toDate() ?? null,
    toegevoegdDoor: data.toegevoegdDoor ?? '',
  };
}

export function subscribeRecepten(
  householdId: string,
  onData: (recepten: Recept[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'households', householdId, 'recipes'),
    orderBy('aangemaakt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => toRecept(d.id, d.data())));
  });
}

export async function addRecept(
  householdId: string,
  recept: Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor'>,
  userId: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'households', householdId, 'recipes'), {
    ...recept,
    aangemaakt: serverTimestamp(),
    toegevoegdDoor: userId,
  });
  return ref.id;
}

export async function updateRecept(
  householdId: string,
  receptId: string,
  data: Partial<Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor'>>
): Promise<void> {
  await updateDoc(doc(db, 'households', householdId, 'recipes', receptId), data);
}

export async function deleteRecept(householdId: string, receptId: string): Promise<void> {
  await deleteDoc(doc(db, 'households', householdId, 'recipes', receptId));
}

// Weekkeuze
function toWeekkeuze(id: string, data: DocumentData): Weekkeuze {
  return {
    id,
    receptId: data.receptId,
    porties: data.porties ?? 4,
    toegevoegd: data.toegevoegd?.toDate() ?? new Date(),
  };
}

export function subscribeWeekkeuze(
  householdId: string,
  onData: (items: Weekkeuze[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'households', householdId, 'weekkeuze'),
    orderBy('toegevoegd', 'asc')
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => toWeekkeuze(d.id, d.data())));
  });
}

export async function addToWeekkeuze(
  householdId: string,
  receptId: string,
  porties: number
): Promise<void> {
  await addDoc(collection(db, 'households', householdId, 'weekkeuze'), {
    receptId,
    porties,
    toegevoegd: serverTimestamp(),
  });
}

export async function updateWeekkeuze(
  householdId: string,
  id: string,
  porties: number
): Promise<void> {
  await updateDoc(doc(db, 'households', householdId, 'weekkeuze', id), { porties });
}

export async function deleteFromWeekkeuze(householdId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'households', householdId, 'weekkeuze', id));
}

export async function clearWeekkeuze(householdId: string, ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteFromWeekkeuze(householdId, id)));
}
