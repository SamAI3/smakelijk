# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173) — AI-functies werken NIET via npm run dev
netlify dev      # Start Vite + Netlify Functions lokaal (vereist: npm i -g netlify-cli)
npm run build    # Type-check + production build → dist/
npm run preview  # Serve de production build lokaal
npx tsc --noEmit # Type-check only
```

## Wat is Smakelijk

Een gedeelde receptenapp voor twee personen. Gebruikers slaan recepten op, maken een weekselectie, en exporteren ingrediënten automatisch naar Apple Reminders via een Apple Shortcut.

## Stack

- **Frontend:** Vite + React + TypeScript
- **Database:** Firebase/Firestore
- **Auth:** Google Sign-In via Firebase Auth
- **Hosting:** Netlify (auto-deploy via GitHub, `netlify.toml` aanwezig)
- **AI:** Anthropic API — `claude-sonnet-4-20250514`, via Netlify Function proxy (niet direct vanuit de browser)
- **Icons:** Lucide React
- **Boodschappenlijst:** Apple Reminders via Apple Shortcuts URL scheme

## Design-systeem

Stijl geïnspireerd op Parra — warm kookboek-gevoel, organische keukentafel-sfeer.

CSS-variabelen in `src/index.css`:

| Variabele | Waarde | Gebruik |
|---|---|---|
| `--bg` | `#FAF6F0` | Pagina-achtergrond (warm crème) |
| `--text` | `#2D2A26` | Primaire tekstkleur |
| `--accent1` | `#C4653A` | Terracotta — primaire acties, FAB, stapnummers |
| `--accent2` | `#7B8C52` | Olijfgroen — secondaire acties, boodschappenknop |
| `--accent3` | `#D4A843` | Mosterd — favoriet-ster |
| `--accent4` | `#D4907E` | Zacht roze/zalm |
| `--accent5` | `#5B7A6E` | Gedempd groen — weekkeuze-knop |
| `--card` | `#FFFFFF` | Kaartachtergrond |
| `--radius` | `16px` | Standaard border-radius |
| `--shadow` | — | Zachte kaartschaduw |

Typografie: `DM Serif Display` (titels) via Google Fonts, `DM Sans` (body/UI).
Alle stijlen zijn inline (geen CSS modules of Tailwind).
Keukentegels krijgen elk een kleur uit de vijf accenten op basis van index % 5.

## Architectuur

Single-page React app met een screen-stack navigatiepatroon (geen router). `App.tsx` beheert een `screen` discriminated union (`tabs | detail | form`) en rendert het juiste component direct.

**Context-hiërarchie** (buiten → binnen):
1. `AuthContext` — Firebase Auth state, Google Sign-In
2. `HouseholdContext` — Firestore household lookup; stuurt naar `OnboardingScreen` als er geen huishouden is
3. `ReceptenContext` — realtime Firestore listeners op `recipes` en `weekkeuze`; exposeert alle CRUD-helpers

**Schermflow:**
```
Niet ingelogd        → LoginScreen
Ingelogd, geen hh    → OnboardingScreen (aanmaken of 6-tekens code invoeren)
Ingelogd + huishouden → Tabs (ReceptenTab / WeekkeuzeTab / InstellingenTab)
  → recept aantikken → ReceptDetailScreen (terug = tabs)
  → toevoegen/bewerken → ReceptFormScreen (terug = detail of tabs)
```

## Firestore datamodel

Alle data leeft onder `households/{householdId}/`.

**Collection `households`:**
```
{ naam, code (6 tekens), leden: string[] (user IDs), aangemaakt }
```

**Subcollection `recipes`:**
```
{
  titel, type: "hoofdgerecht"|"overig",
  ingredienten: [{ hoeveelheid: number, eenheid, naam }],
  bereiding: string[],
  keuken, moeilijkheid: "doordeweeks"|"weekend",
  bereidingstijd (min), porties, tags: string[],
  notities, bronUrl, favoriet, aangemaakt, laatstGemaakt, toegevoegdDoor
}
```

**Subcollection `weekkeuze`:**
```
{ receptId, porties (aangepast), toegevoegd }
```

Firestore timestamps worden omgezet naar `Date`-objecten in de `toRecept`/`toWeekkeuze` mapper-functies in `src/services/recepten.ts`.

Toegestane eenheden: `gram · kg · ml · liter · stuks · el · tl · snuf · pak · blik · teen · takje · blad`

## Recepten-tab

Layout van boven naar beneden:
1. Toggle Hoofdgerechten / Overig
2. Zoekbalk (zoekt op titel, keuken, tags)
3. Favorieten-sectie
4. Keukentegels — horizontaal scrollbaar, dynamisch op basis van aanwezige recepten
5. Recent toegevoegd (of gefilterd op geselecteerde keuken)
6. FAB (+) rechtsonder voor recept toevoegen

## Recept detailscherm

- Portie-aanpasser (+/-): ingrediënthoeveelheden schalen mee via `factor = aangepastPorties / standaardPorties`
- Acties: favoriet toggle, weekkeuze toevoegen, bewerken, verwijderen (met bevestigingsdialoog)
- Kookmodus: fullscreen, grote tekst, `navigator.wakeLock` houdt scherm aan

## Recept toevoegen (ReceptFormScreen)

Drie sub-tabs:
1. **Handmatig** — formulier met alle velden
2. **URL** — plak URL → `parseReceptFromUrl()` → AI vult formulier in → gebruiker checkt → opslaan
3. **Foto** — `<input type="file" capture="environment">` → `parseReceptFromImage()` → zelfde flow

`src/services/ai.ts` roept `/.netlify/functions/ai` aan via `fetch` (geen SDK in de browser). De serverless function `netlify/functions/ai.mts` gebruikt `@anthropic-ai/sdk` server-side met `ANTHROPIC_API_KEY`. Beide functies retourneren een partieel `Recept`-object of `null`. Na een succesvol AI-resultaat schakelt de tab automatisch terug naar "Handmatig" voor controle.

## Weekkeuze-tab

- Recepten toevoegen via "Weekkeuze"-knop op het detailscherm
- Per recept: portie-aantal aanpasbaar (onafhankelijk van standaardporties)
- "Wis alles" verwijdert alle weekkeuze-items (wekelijks resetten)
- "Naar boodschappenlijst" → boodschappenmodus:
  - Ingrediënten samengevoegd: zelfde naam (lowercase) + zelfde eenheid → hoeveelheden optellen; verschillende eenheden → aparte regels
  - Gebruiker vinkt af wat al in huis is
  - "Exporteer" opent Apple Shortcut

## Apple Shortcut integratie

```
shortcuts://run-shortcut?name=Boodschappen&input=text&text=[ingrediënten, newline-gescheiden]
```

Vereist een Shortcut genaamd **"Boodschappen"** die:
1. Tekstinput ontvangt (één ingrediënt per regel)
2. De tekst splitst op newlines
3. Elk item toevoegt aan een gedeelde Apple Reminders-lijst

De Shortcut moet handmatig worden aangemaakt op de telefoons van beide gebruikers. De app triggert via `window.location.href`.

## Conventies

- Volledige UI in het Nederlands.
- `ReceptType`: `"hoofdgerecht" | "overig"` — de hoofd-toggle.
- `Moeilijkheid`: `"doordeweeks" | "weekend"`.
- Startset keukens: Italiaans, Aziatisch, Frans, Nederlands, Midden-Oosters — uitbreidbaar, dynamisch op basis van recepten in de database.
- Huishouden-uitnodigingscode: 6 tekens, hoofdletters + cijfers (zonder O/0/I/1 lookalikes).
