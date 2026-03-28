import { Recept, Ingredient, Eenheid } from '../types';

type ReceptData = Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor' | 'favoriet' | 'laatstGemaakt'>;

function parseJSON(text: string): ReceptData | null {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

async function callAiFunction(body: object): Promise<string | null> {
  const res = await fetch('/.netlify/functions/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const data = await res.json() as { text: string };
  return data.text ?? null;
}

export async function parseReceptFromUrl(url: string): Promise<ReceptData | null> {
  try {
    const text = await callAiFunction({ type: 'url', url });
    return text ? parseJSON(text) : null;
  } catch (err) {
    console.error('AI URL parse error:', err);
    return null;
  }
}

export async function parseReceptFromImage(base64: string, mimeType: string): Promise<ReceptData | null> {
  try {
    const text = await callAiFunction({ type: 'image', base64, mimeType });
    return text ? parseJSON(text) : null;
  } catch (err) {
    console.error('AI image parse error:', err);
    return null;
  }
}

export function legeIngredient(): Ingredient {
  return { hoeveelheid: 0, eenheid: 'stuks' as Eenheid, naam: '' };
}

export function leegRecept(): Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor'> {
  return {
    titel: '',
    type: 'hoofdgerecht',
    ingredienten: [],
    bereiding: [],
    keuken: '',
    moeilijkheid: 'doordeweeks',
    bereidingstijd: 30,
    porties: 4,
    tags: [],
    notities: '',
    bronUrl: '',
    favoriet: false,
    laatstGemaakt: null,
  };
}
