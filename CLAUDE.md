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
- **Icons:** Phosphor Icons (`@phosphor-icons/react`) — duotone als standaard weight via `<IconContext.Provider value={{ weight: 'duotone' }}>` in App.tsx
- **Boodschappenlijst:** Apple Reminders via Apple Shortcuts URL scheme

## Design-systeem

Stijl geïnspireerd op Parra — warm kookboek-gevoel, organische keukentafel-sfeer. Kleurenpalet gebaseerd op de diner-illustratie (cobalt-blauw + wijnrood).

CSS-variabelen in `src/index.css`:

| Variabele | Waarde | Gebruik |
|---|---|---|
| `--cobalt` | `#162D6E` | Primaire kleur — knoppen, actieve tab, stapnummers |
| `--cobalt-light` | `#1B3FA0` | Hover-staat cobalt |
| `--cobalt-dark` | `#0F1F4D` | Sidebar, donkere accenten |
| `--crimson` | `#8B2529` | Destructieve acties, FAB, weekend-badge |
| `--crimson-light` | `#B8312F` | Hover-staat crimson |
| `--amber` | `#E8A838` | Favoriet-ster |
| `--olive` | `#4A7C59` | Boodschappenknop, doordeweeks-badge |
| `--ink` | `#1A1A2E` | Primaire tekstkleur (donkerder dan --text) |
| `--text-secondary` | `#5C5C6E` | Secondaire tekst |
| `--text-muted` | `#8A8A9A` | Gedempte tekst, placeholders |
| `--bg` | `#F5F0E8` | Pagina-achtergrond (warm crème) |
| `--card` | `#FFFDF7` | Kaartachtergrond — OOK de tab bar en html/body achtergrond |
| `--border-color` | `#E0D9CC` | Inputranden |
| `--border-light` | `#EDE8DE` | Subtiele scheidingslijnen |
| `--radius` | `16px` | Standaard border-radius |
| `--tab-height` | `72px` | Hoogte van de tab bar (exclusief safe area) |

Legacy accent-variabelen (`--accent1` t/m `--accent5`) zijn aliassen voor de primaire kleuren en worden nog gebruikt in enkele componenten.

Typografie: `Playfair Display` (titels, 700/900) + `DM Sans` (body/UI) via Google Fonts.
Alle stijlen zijn inline (geen CSS modules of Tailwind).

### Keuken-iconen

Keukens worden gerepresenteerd door landenvlaggen (emoji): 🇮🇹 Italiaans, 🇫🇷 Frans, 🌏 Aziatisch, 🇹🇭 Thais, 🇨🇳 Chinees, 🇯🇵 Japans, 🇲🇽 Mexicaans, 🇪🇸 Spaans, 🇳🇱 Nederlands, 🇮🇳 Indiaas, 🌙 Arabisch/Midden-Oosters, 🇬🇷 Grieks. Mapping staat in `KEUKEN_EMOJI` in `ReceptenTab.tsx` en `WeekkeuzeTab.tsx`.

## Illustratie-systeem

`public/illustrations/diner-scene.png` — handgetekende tafelscène (cobalt + crimson inkt). Geïntegreerd via de herbruikbare component `src/components/DinerIllustration.tsx`.

```tsx
// Secties mappen naar object-position waarden
type DinerSection = 'full' | 'wine' | 'olive' | 'bread' | 'cheese' | 'candle';

<DinerIllustration section="full" style={{ width: '100%', height: 260 }} loading="eager" />
```

**Gebruik per scherm:**
- `ReceptenTab` — hero banner full-bleed (260px mobiel / 300px tablet), `objectPosition: 'center 70%'`
- `WeekkeuzeTab` — zelfde hero (200/240px) in zowel lege als gevulde state
- `FeaturedReceptCard` — subtiele achtergrond, wine-sectie, opacity 0.07, `mixBlendMode: 'multiply'`
- `ReceptDetailScreen` — olive-sectie in header, opacity 0.04
- `Kookmodus` — full illustratie als subtiele achtergrond, opacity 0.03
- `LoginScreen` — 260×200px, borderRadius 24
- `OnboardingScreen` — cheese-sectie, 140×100px
- `InstellingenTab` — cheese-sectie, 72×72px naast h1

**Gradient overlay op hero:**
```css
linear-gradient(to bottom,
  rgba(15,10,5,0.28) 0%,     /* donker boven: status bar leesbaar */
  transparent 22%,
  rgba(245,240,232,0.50) 68%,
  rgba(245,240,232,0.92) 100% /* crème onder: filters leesbaar */
)
```

Decoratieve/overlay elementen hebben altijd `pointerEvents: 'none'`.

## PWA-configuratie

**`index.html`:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

`black-translucent` zorgt voor edge-to-edge rendering — content loopt achter de iOS status bar. Visuele elementen mogen achter de safe areas lopen; interactieve elementen (knoppen, toggles) krijgen `padding-top: calc(env(safe-area-inset-top, 20px) + 8px)`.

**`public/manifest.json`:**
- `"display": "standalone"`
- `"background_color": "#FFFDF7"` — moet exact matchen met tab bar en `html` background. iOS gebruikt dit voor de home indicator zone.

**App icons** gegenereerd vanuit de diner-illustratie via `scripts/generate-icons.js` (gebruikt `sharp`): `public/icon-192.png` en `public/icon-512.png`.

## iOS safe area & tab bar

De tab bar (`src/components/TabBar.tsx`) is `position: fixed; bottom: 0; left: 0; right: 0` met `paddingBottom: env(safe-area-inset-bottom, 0px)` en `background: #FFFDF7` (hardcoded, niet via variabele).

**Achtergrondkleur-ketting** — allemaal `#FFFDF7` zodat de iOS home indicator zone nooit een andere kleur toont:
- `html { background: #FFFDF7 }`
- `body { background: #FFFDF7 }`
- `#root { background: #FFFDF7 }`
- Tab bar: `background: #FFFDF7`
- `manifest.json background_color: #FFFDF7`

**Hoogte-ketting voor scroll:**
```
#root { min-height: 100dvh }   ← groeit niet kleiner dan viewport
  └── wrapper { flex: 1, minHeight: 0, overflow: hidden }
        └── Screen { flex: 1, minHeight: 0, overflowY: auto }  ← scrollt
```
`minHeight: 0` op elke flex-schakel is essentieel — zonder dit claimt `min-height: auto` teveel ruimte en scrollen scroll containers niet.

**Touch scroll fix:**
```css
.recipe-card, .recipe-featured-card, .recipe-compact-row {
  touch-action: pan-y;        /* iOS: vertikale swipe = scroll */
  user-select: none;
}
.page-enter {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

## Architectuur

Single-page React app met een screen-stack navigatiepatroon (geen router). `App.tsx` beheert een `screen` discriminated union en rendert het juiste component direct.

**Screen type:**
```ts
type Screen =
  | { type: 'tabs' }
  | { type: 'detail'; recept: Recept; kookModus?: boolean }  // kookModus start direct kookmodus
  | { type: 'form'; recept?: Recept };
```

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
  → weekkeuze "Koken" → ReceptDetailScreen met kookModus: true
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
1. **Immersive hero** — DinerIllustration full-bleed (260px mobiel / 300px tablet), gradient overlay, geen titel
2. **Frosted glass filters** op de onderkant van de hero (positie: absolute, bottom: 12):
   - Toggle Hoofdgerechten / Overig (cobalt als actief)
   - Doordeweeks / Weekend / Alles chips
3. **Zoekbalk** direct onder de hero
4. **Favorieten-sectie** — CompactReceptRij componenten
5. **Keukentegels** — horizontaal scrollbaar, landenvlaggen, tints per keuken
6. **Receptenlijst** — eerste recept als FeaturedReceptCard (groot), rest als CompactReceptRij
7. **FAB** (+) rechtsonder, `position: fixed, bottom: calc(var(--tab-height) + 16px)`

## Recept detailscherm

- Header: `paddingTop: calc(env(safe-area-inset-top, 20px) + 8px)` zodat knoppen onder status bar vallen
- Portie-aanpasser (+/-): ingrediënthoeveelheden schalen mee via `factor = aangepastPorties / standaardPorties`
- Acties: favoriet toggle, weekkeuze toevoegen, bewerken, verwijderen (met bevestigingsdialoog)
- Kookmodus: zie sectie hieronder

## Kookmodus

Licht kookboek-design (crème achtergrond `#FAF7F0`), activated via `kookModus` state of via `kookModusInitieel` prop (vanuit weekkeuze).

- Header: frosted glass, sluitknop (X), `paddingTop: calc(env(safe-area-inset-top, ...) + 8px)`
- **Ingrediënten**: tappable om af te vinken (opacity 0.35 + line-through), `maxHeight: 42vh` met scroll op mobiel
- **Bereiding**: tappable om actieve stap te markeren (cobalt highlight), scrollbaar
- **Tablet**: 2-kolommen layout (ingrediënten links 300px, bereiding rechts)
- `navigator.wakeLock` houdt scherm aan tijdens koken

## Weekkeuze-tab

**Gevulde state:**
1. Hero illustratie (200px mobiel / 240px tablet)
2. Frosted glass header card (−50px margin-top over hero): "Wat eten we deze week?" + automatisch weekdatumbereik (maandag–zondag, Nederlands). Berekend via `getWeekBereik()` in `WeekkeuzeTab.tsx`.
3. Recept cards met portie-aanpasser en **"Koken" knop** (ChefHat icon) — opent direct kookmodus via `onStartKoken` callback
4. "Naar boodschappenlijst" knop — max-width 320px, gecentreerd
5. "Weekkeuze wissen" — onderaan, subtiele crimson tekst-link (destructieve actie)

**Boodschappenmodus:** ingrediënten samengevoegd (zelfde naam + eenheid → optellen), aftikbaar, exporteer naar Apple Shortcut.

## Recept toevoegen (ReceptFormScreen)

Drie sub-tabs:
1. **Handmatig** — formulier met alle velden
2. **URL** — plak URL → `parseReceptFromUrl()` → AI vult formulier in → gebruiker checkt → opslaan
3. **Foto** — `<input type="file" capture="environment">` → `parseReceptFromImage()` → zelfde flow

`src/services/ai.ts` roept `/.netlify/functions/ai` aan via `fetch` (geen SDK in de browser). De serverless function `netlify/functions/ai.mts` gebruikt `@anthropic-ai/sdk` server-side met `ANTHROPIC_API_KEY`. Beide functies retourneren een partieel `Recept`-object of `null`. Na een succesvol AI-resultaat schakelt de tab automatisch terug naar "Handmatig" voor controle.

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
- Na het opslaan/verwijderen van een recept → terug naar tabs (niet naar detail).
