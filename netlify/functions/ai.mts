import Anthropic from '@anthropic-ai/sdk';
import type { Context } from '@netlify/functions';

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

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let body: { type: 'url'; url: string } | { type: 'image'; base64: string; mimeType: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  try {
    let response: Anthropic.Message;

    if (body.type === 'url') {
      response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Haal het recept op van deze URL en converteer het naar JSON: ${body.url}\n\nAls je de URL niet kunt bezoeken, baseer dan een recept op de URL-naam.`,
        }],
      });
    } else if (body.type === 'image') {
      response = await client.messages.create({
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
                media_type: body.mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
                data: body.base64,
              },
            },
            {
              type: 'text',
              text: 'Extraheer het recept uit deze afbeelding en converteer naar JSON.',
            },
          ],
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

export const config = { path: '/api/ai' };
