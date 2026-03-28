import Anthropic from '@anthropic-ai/sdk';
import { Recept, Ingredient, Eenheid } from '../types';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

type ReceptData = Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor' | 'favoriet' | 'laatstGemaakt'>;

const SYSTEM_PROMPT = `Je bent een expert in het verwerken van recepten. Geef altijd een JSON-object terug (geen markdown, geen uitleg) met exact deze structuur:
{
  "titel": "string",
  "type": "hoofdgerecht" | "overig",
  "ingredienten": [{ "hoeveelheid": number, "eenheid": "gram"|"ml"|"stuks"|"el"|"tl"|"snuf"|"kg"|"liter"|"pak"|"blik"|"teen"|"takje"|"blad", "naam": "string" }],
  "bereiding": ["string"],
  "keuken": "string",
  "moeilijkheid": "doordeweeks" | "weekend",
  "bereidingstijd": number,
  "porties": number,
  "tags": ["string"],
  "notities": "string",
  "bronUrl": "string"
}
Vertaal alles naar het Nederlands. Gebruik realistische hoeveelheden. bereidingstijd in minuten.`;

function parseJSON(text: string): ReceptData | null {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export async function parseReceptFromUrl(url: string): Promise<ReceptData | null> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Haal het recept op van deze URL en converteer het naar JSON: ${url}\n\nAls je de URL niet kunt bezoeken, baseer dan een recept op de URL-naam.`,
      }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return parseJSON(text);
  } catch (err) {
    console.error('AI URL parse error:', err);
    return null;
  }
}

export async function parseReceptFromImage(base64: string, mimeType: string): Promise<ReceptData | null> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Extraheer het recept uit deze afbeelding en converteer naar JSON.',
          },
        ],
      }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return parseJSON(text);
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
