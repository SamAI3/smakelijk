import Anthropic from '@anthropic-ai/sdk';
import type { Context } from '@netlify/functions';

const RECEPT_SYSTEM_PROMPT = `Je bent een expert in het verwerken van recepten. Geef altijd een JSON-object terug (geen markdown, geen uitleg) met exact deze structuur:
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

const INGREDIENTEN_PROMPT = `Verwerk deze ingrediëntenlijst en geef ALLEEN een JSON array terug (geen markdown, geen uitleg, geen andere tekst):
[{ "hoeveelheid": number (gebruik 0 als er geen hoeveelheid is), "eenheid": "gram"|"kg"|"ml"|"liter"|"stuks"|"el"|"tl"|"snuf"|"pak"|"blik"|"teen"|"takje"|"blad", "naam": "string (alleen de naam, zonder hoeveelheid of eenheid)" }]`;

type RequestBody =
  | { type: 'url'; url: string }
  | { type: 'image'; base64: string; mimeType: string }
  | { type: 'parse-ingredients'; text: string };

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  try {
    let response: Anthropic.Message;

    if (body.type === 'url') {
      response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: RECEPT_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Haal het recept op van deze URL en converteer het naar JSON: ${body.url}\n\nAls je de URL niet kunt bezoeken, baseer dan een recept op de URL-naam.`,
        }],
      });

    } else if (body.type === 'image') {
      const mimeType = body.mimeType as 'image/jpeg' | 'image/png' | 'image/webp';
      response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: RECEPT_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: body.base64 },
            },
            {
              type: 'text',
              text: 'Extraheer het volledige recept uit deze afbeelding, inclusief titel, alle ingrediënten met exacte hoeveelheden en eenheden, en alle bereidingsstappen. Converteer naar JSON.',
            },
          ],
        }],
      });

    } else if (body.type === 'parse-ingredients') {
      response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `${INGREDIENTEN_PROMPT}\n\nIngrediënten:\n${body.text}`,
        }],
      });

    } else {
      return new Response('Invalid request type', { status: 400 });
    }

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Anthropic API error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};
