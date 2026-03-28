import { Recept, Ingredient, Eenheid } from '../types';

type ReceptData = Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor' | 'favoriet' | 'laatstGemaakt'>;

function parseJSON<T>(text: string): T | null {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean) as T;
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

/** Comprimeer foto client-side voor verzending (max 1500px, JPEG 0.85). */
export async function compressImage(
  file: File,
  maxDim = 1500,
  quality = 0.85
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function parseReceptFromUrl(url: string): Promise<ReceptData | null> {
  try {
    const text = await callAiFunction({ type: 'url', url });
    return text ? parseJSON<ReceptData>(text) : null;
  } catch (err) {
    console.error('AI URL parse error:', err);
    return null;
  }
}

export async function parseReceptFromImage(base64: string, mimeType: string): Promise<ReceptData | null> {
  try {
    const text = await callAiFunction({ type: 'image', base64, mimeType });
    return text ? parseJSON<ReceptData>(text) : null;
  } catch (err) {
    console.error('AI image parse error:', err);
    return null;
  }
}

export async function parseIngredienten(tekst: string): Promise<Ingredient[] | null> {
  try {
    const text = await callAiFunction({ type: 'parse-ingredients', text: tekst });
    return text ? parseJSON<Ingredient[]>(text) : null;
  } catch (err) {
    console.error('AI ingredients parse error:', err);
    return null;
  }
}

/** Splits bereidingstekst in stappen (client-side, geen AI nodig). */
export function splitStappen(tekst: string): string[] {
  const trimmed = tekst.trim();
  if (!trimmed) return [];

  // Genummerd patroon: "1. " of "1) " of "Stap 1:" aan begin van regel
  if (/^\d+[\.\)]\s/m.test(trimmed) || /^stap\s+\d+/im.test(trimmed)) {
    const stappen = trimmed
      .split(/\n(?=\d+[\.\)]\s|\bstap\s+\d+)/i)
      .map((s) => s.replace(/^\d+[\.\)]\s+/, '').replace(/^stap\s+\d+[:\s]+/i, '').trim())
      .filter(Boolean);
    if (stappen.length > 1) return stappen;
  }

  // Dubbele newlines → alinea's
  const alineas = trimmed.split(/\n\s*\n/).map((s) => s.replace(/\n/g, ' ').trim()).filter(Boolean);
  if (alineas.length > 1) return alineas;

  // Enkele newlines
  const regels = trimmed.split('\n').map((s) => s.trim()).filter(Boolean);
  if (regels.length > 1) return regels;

  // Één blok tekst: splits op punt + hoofdletter (zinnen)
  const zinnen = trimmed
    .split(/(?<=\.)\s+(?=[A-ZА-ЯA-Z\u00C0-\u024F])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  if (zinnen.length > 1) return zinnen;

  return [trimmed];
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
