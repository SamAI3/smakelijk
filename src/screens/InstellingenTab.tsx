import { useState, useRef } from 'react';
import { SignOut, Copy, Check, UsersThree, Upload, FileText, X, UserCircle, CheckCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { useRecepten } from '../context/ReceptenContext';
import { Recept, ReceptType, Moeilijkheid } from '../types';
import { bepaalMoeilijkheid } from '../services/ai';
import { CookbookIllustration } from '../components/illustrations/Decorations';

// ── JSON import types ────────────────────────────────────────────
type ImportRecept = Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor' | 'favoriet' | 'laatstGemaakt'>;

const GELDIGE_EENHEDEN = new Set([
  'gram', 'kg', 'ml', 'liter', 'stuks', 'el', 'tl',
  'snuf', 'pak', 'blik', 'teen', 'takje', 'blad',
]);

type EenheidConversie = { eenheid: string; factor?: number };

const EENHEID_MAP: Record<string, EenheidConversie> = {
  // EN tablespoon/teaspoon
  tablespoon: { eenheid: 'el' }, tablespoons: { eenheid: 'el' }, tbsp: { eenheid: 'el' },
  teaspoon: { eenheid: 'tl' }, teaspoons: { eenheid: 'tl' }, tsp: { eenheid: 'tl' },
  // cups / volume
  cup: { eenheid: 'ml', factor: 240 }, cups: { eenheid: 'ml', factor: 240 },
  glass: { eenheid: 'ml', factor: 200 }, glas: { eenheid: 'ml', factor: 200 },
  // weight
  g: { eenheid: 'gram' },
  ounce: { eenheid: 'gram', factor: 28 }, ounces: { eenheid: 'gram', factor: 28 }, oz: { eenheid: 'gram', factor: 28 },
  pound: { eenheid: 'gram', factor: 454 }, pounds: { eenheid: 'gram', factor: 454 },
  lb: { eenheid: 'gram', factor: 454 }, lbs: { eenheid: 'gram', factor: 454 },
  // liquid
  l: { eenheid: 'liter' },
  // pieces / stuks
  piece: { eenheid: 'stuks' }, pieces: { eenheid: 'stuks' },
  stuk: { eenheid: 'stuks' }, stukken: { eenheid: 'stuks' },
  handful: { eenheid: 'stuks' }, handvol: { eenheid: 'stuks' },
  // herbs / specials
  clove: { eenheid: 'teen' }, cloves: { eenheid: 'teen' },
  sprig: { eenheid: 'takje' }, sprigs: { eenheid: 'takje' },
  leaf: { eenheid: 'blad' }, leaves: { eenheid: 'blad' },
  pinch: { eenheid: 'snuf' },
  can: { eenheid: 'blik' }, cans: { eenheid: 'blik' },
  pack: { eenheid: 'pak' }, package: { eenheid: 'pak' }, packages: { eenheid: 'pak' },
};

function normaliseerEenheid(
  eenheid: string,
  hoeveelheid: number
): { eenheid: string; hoeveelheid: number } {
  const key = (eenheid ?? '').trim().toLowerCase();
  if (!key) return { eenheid: 'stuks', hoeveelheid: hoeveelheid || 1 };
  if (GELDIGE_EENHEDEN.has(key)) return { eenheid: key, hoeveelheid: hoeveelheid || 0 };
  const conversie = EENHEID_MAP[key];
  if (conversie) {
    return {
      eenheid: conversie.eenheid,
      hoeveelheid: conversie.factor ? Math.round((hoeveelheid || 1) * conversie.factor) : (hoeveelheid || 0),
    };
  }
  return { eenheid: 'stuks', hoeveelheid: hoeveelheid || 1 };
}

/** Parse bereidingstijd from text or number. "1 uur en 40 minuten" → 100, "35 min" → 35. */
function parseBereidingstijd(raw: unknown): number {
  if (typeof raw === 'number' && !isNaN(raw)) return Math.round(raw);
  if (!raw) return 30;
  const s = String(raw).toLowerCase();
  let minuten = 0;
  const uurMatch = s.match(/(\d+)\s*(?:uur|hour|hr|u\b)/);
  const minMatch = s.match(/(\d+)\s*(?:min|minute|minuten|m\b)/);
  if (uurMatch) minuten += parseInt(uurMatch[1]) * 60;
  if (minMatch) minuten += parseInt(minMatch[1]);
  if (minuten > 0) return minuten;
  // fallback: first number
  const numMatch = s.match(/\d+/);
  return numMatch ? parseInt(numMatch[0]) : 30;
}

/** Parse porties from text or number. "4-6 personen" → 4. */
function parsePorries(raw: unknown): number {
  if (typeof raw === 'number' && !isNaN(raw)) return Math.round(raw);
  if (!raw) return 4;
  const numMatch = String(raw).match(/\d+/);
  return numMatch ? parseInt(numMatch[0]) : 4;
}

/** Get a value from raw using multiple possible field names. */
function getField(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in raw && raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

/** Flatten nested ingredient structures (object with category keys → flat array). */
function flattenIngredienten(raw: unknown): Record<string, unknown>[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    const result: Record<string, unknown>[] = [];
    for (const item of raw) {
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        // Is this an ingredient object (has naam/name/item)?
        const hasNaam = 'naam' in obj || 'name' in obj || 'item' in obj || 'ingredient' in obj;
        if (hasNaam) {
          result.push(obj);
        } else {
          // Treat as category → flatten its values
          for (const val of Object.values(obj)) {
            if (Array.isArray(val)) {
              result.push(...flattenIngredienten(val));
            }
          }
        }
      } else if (typeof item === 'string') {
        result.push({ naam: item });
      }
    }
    return result;
  }
  if (typeof raw === 'object' && raw !== null) {
    // Object of categories
    const result: Record<string, unknown>[] = [];
    for (const val of Object.values(raw as Record<string, unknown>)) {
      result.push(...flattenIngredienten(val));
    }
    return result;
  }
  return [];
}

/** Extract step text from string or object ({content, text, description, stap, step}). */
function extractStap(item: unknown): string {
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    const val = obj.content ?? obj.text ?? obj.description ?? obj.stap ?? obj.step ?? obj.instructie ?? '';
    return String(val).trim();
  }
  return String(item ?? '').trim();
}

function normaliseerRecept(raw: Record<string, unknown>): ImportRecept {
  // ── Titel ──
  const titel = String(getField(raw, 'titel', 'title', 'name', 'naam', 'recept') ?? '');

  // ── Type ──
  const typeRaw = String(getField(raw, 'type', 'category', 'categorie') ?? '');
  const type: ReceptType = ['hoofdgerecht', 'overig'].includes(typeRaw) ? typeRaw as ReceptType : 'hoofdgerecht';

  // ── Ingrediënten ──
  const ingRaw = getField(raw, 'ingredienten', 'ingredients', 'ingrediënten');
  const ingFlat = flattenIngredienten(ingRaw);
  const ingredienten = ingFlat.map((ing) => {
    const naam = String(getField(ing, 'naam', 'name', 'item', 'ingredient', 'ingrediënt') ?? '');
    const hoeveelheidRaw = getField(ing, 'hoeveelheid', 'amount', 'quantity', 'hoeveelheid');
    const eenheidRaw = String(getField(ing, 'eenheid', 'unit', 'eenheid') ?? '');
    const { eenheid, hoeveelheid } = normaliseerEenheid(eenheidRaw, Number(hoeveelheidRaw) || 0);
    return { hoeveelheid, eenheid, naam };
  });

  // ── Bereiding ──
  const berRaw = getField(raw, 'bereiding', 'steps', 'instructions', 'instructies', 'preparation', 'method');
  const bereiding: string[] = Array.isArray(berRaw)
    ? (berRaw as unknown[]).map(extractStap).filter(Boolean)
    : [];

  // ── Keuken ──
  const keuken = String(getField(raw, 'keuken', 'cuisine', 'kitchen') ?? '');

  // ── Bereidingstijd ──
  const bereidingstijd = parseBereidingstijd(
    getField(raw, 'bereidingstijd', 'prepTime', 'prep_time', 'preparationTime', 'tijd', 'time', 'totalTime', 'total_time')
  );

  // ── Moeilijkheid: automatisch op basis van bereidingstijd ──
  const moeilijkheid: Moeilijkheid = bepaalMoeilijkheid(bereidingstijd);

  // ── Porties ──
  const porties = parsePorries(
    getField(raw, 'porties', 'servings', 'base_servings', 'personen', 'serves', 'portions')
  );

  // ── Tags ──
  const tagsRaw = getField(raw, 'tags', 'labels', 'keywords');
  const tags: string[] = Array.isArray(tagsRaw) ? (tagsRaw as unknown[]).map(String) : [];

  // ── Notities: merge various extra fields ──
  const notitiesDelen: string[] = [];
  const basisNotities = String(getField(raw, 'notities', 'notes', 'note', 'description', 'omschrijving') ?? '');
  if (basisNotities) notitiesDelen.push(basisNotities);

  // bron object → notities
  const bronObj = getField(raw, 'bron', 'source', 'book', 'boek');
  if (bronObj && typeof bronObj === 'object' && bronObj !== null) {
    const b = bronObj as Record<string, unknown>;
    const delen = [b.boek ?? b.book ?? b.titel ?? b.title, b.auteur ?? b.author, b.pagina !== undefined ? `p. ${b.pagina}` : undefined].filter(Boolean);
    if (delen.length) notitiesDelen.push(`Bron: ${delen.join(', ')}`);
  } else if (typeof bronObj === 'string' && bronObj) {
    notitiesDelen.push(`Bron: ${bronObj}`);
  }

  // wijn, tip, benodigdheden → notities
  const wijn = String(getField(raw, 'wijnpairing', 'wine', 'wijn') ?? '');
  if (wijn) notitiesDelen.push(`Wijn: ${wijn}`);
  const tip = String(getField(raw, 'tip', 'tips', 'hint') ?? '');
  if (tip) notitiesDelen.push(`Tip: ${tip}`);
  const benodigdheden = getField(raw, 'benodigdheden', 'equipment', 'tools');
  if (benodigdheden) {
    const lijst = Array.isArray(benodigdheden) ? (benodigdheden as unknown[]).join(', ') : String(benodigdheden);
    if (lijst) notitiesDelen.push(`Benodigdheden: ${lijst}`);
  }

  // ── bronUrl ──
  const bronUrl = String(getField(raw, 'bronUrl', 'url', 'source_url', 'link') ?? '');

  return {
    titel, type, ingredienten, bereiding, keuken, moeilijkheid,
    bereidingstijd, porties, tags,
    notities: notitiesDelen.join('\n\n'),
    bronUrl,
    favoriet: false,
    laatstGemaakt: null,
  };
}

function heeftTitel(r: Record<string, unknown>): boolean {
  return ['titel', 'title', 'name', 'naam', 'recept'].some((k) => k in r && Boolean(r[k]));
}

function parseImportJson(tekst: string): ImportRecept[] | string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(tekst.trim());
  } catch {
    return 'Ongeldig JSON-formaat. Controleer of de tekst geldige JSON is.';
  }
  const arr: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return 'Geen recepten gevonden in het bestand.';
  const objects = arr.filter(
    (r): r is Record<string, unknown> =>
      typeof r === 'object' && r !== null && heeftTitel(r)
  );
  if (objects.length === 0) return "Geen geldige recepten gevonden (elk recept heeft een 'titel' of 'title' nodig).";
  return objects.map(normaliseerRecept);
}

// ── Hoofd component ──────────────────────────────────────────────
export default function InstellingenTab() {
  const { user, signOutUser } = useAuth();
  const { household } = useHousehold();
  const { addRecept } = useRecepten();
  const [codeCopied, setCodeCopied] = useState(false);

  // Import state
  type ImportStatus = 'idle' | 'preview' | 'importing' | 'done';
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importRecepten, setImportRecepten] = useState<ImportRecept[]>([]);
  const [geselecteerd, setGeselecteerd] = useState<Set<number>>(new Set());
  const [importError, setImportError] = useState('');
  const [importSucces, setImportSucces] = useState(0);
  const [jsonTekst, setJsonTekst] = useState('');
  const bestandRef = useRef<HTMLInputElement>(null);

  const copyCode = async () => {
    if (!household) return;
    await navigator.clipboard.writeText(household.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const verwerkJson = (tekst: string) => {
    setImportError('');
    try {
      const result = parseImportJson(tekst);
      if (typeof result === 'string') {
        setImportError(result);
        return;
      }
      setImportRecepten(result);
      setGeselecteerd(new Set(result.map((_, i) => i)));
      setImportStatus('preview');
    } catch (err) {
      setImportError(`Onverwachte fout: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleBestand = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const tekst = e.target?.result as string;
      setJsonTekst(tekst);
      verwerkJson(tekst);
    };
    reader.readAsText(file);
  };

  const toggleSelectie = (i: number) => {
    setGeselecteerd((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleAlles = () => {
    if (geselecteerd.size === importRecepten.length) {
      setGeselecteerd(new Set());
    } else {
      setGeselecteerd(new Set(importRecepten.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    setImportStatus('importing');
    const teImporteren = importRecepten.filter((_, i) => geselecteerd.has(i));
    let succesCount = 0;
    for (const recept of teImporteren) {
      try {
        await addRecept(recept);
        succesCount++;
      } catch {
        // Ga door bij fout op één recept
      }
    }
    setImportSucces(succesCount);
    setImportStatus('done');
  };

  const resetImport = () => {
    setImportStatus('idle');
    setImportRecepten([]);
    setGeselecteerd(new Set());
    setImportError('');
    setImportSucces(0);
    setJsonTekst('');
  };

  return (
    <div className="page-enter" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '20px 20px 8px' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 44, fontWeight: 900, marginBottom: 4, color: 'var(--ink)', lineHeight: 1.0, letterSpacing: '-0.5px' }}>
          Instellingen
        </h1>
      </div>

      <div style={{ padding: '8px 20px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Account */}
        <SettingsSection title="Account" icon={<UserCircle size={13} weight="duotone" />}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px', background: 'var(--card)',
            borderRadius: 14, boxShadow: 'var(--shadow)',
          }}>
            {user?.photoURL ? (
              <img
                src={user.photoURL} alt="Avatar"
                style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: 'var(--accent4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#fff',
              }}>
                {user?.displayName?.[0] ?? '?'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                {user?.displayName ?? 'Onbekend'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={signOutUser}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '13px 16px', borderRadius: 12,
              background: 'var(--card)', boxShadow: 'var(--shadow)',
              color: 'var(--crimson)', fontSize: 14, fontWeight: 600,
              width: '100%', textAlign: 'left',
            }}
          >
            <SignOut size={18} />
            Uitloggen
          </button>
        </SettingsSection>

        {/* Huishouden */}
        {household && (
          <SettingsSection title="Huishouden" icon={<UsersThree size={13} weight="duotone" />}>
            <div style={{ background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <SettingsRow label="Naam" value={household.naam} />
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>Uitnodigingscode</div>
                  <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: 24, letterSpacing: 5, color: 'var(--amber)' }}>
                    {household.code}
                  </div>
                </div>
                <button
                  onClick={copyCode}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: codeCopied ? 'var(--olive)' : 'rgba(26,26,46,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: codeCopied ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
                  }}
                >
                  {codeCopied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                </button>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <UsersThree size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {household.leden.length} lid{household.leden.length !== 1 ? 'en' : ''}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Deel de code met huisgenoten om samen recepten te beheren.
            </p>
          </SettingsSection>
        )}

        {/* ── Recepten importeren ── */}
        <SettingsSection title="Importeren" icon={<Upload size={13} weight="duotone" />}>
          {importStatus === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <CookbookIllustration width={80} style={{ flexShrink: 0, opacity: 0.85 }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Importeer recepten vanuit een JSON-bestand of plak JSON rechtstreeks.
                </p>
              </div>

              {/* Bestand uploaden */}
              <input
                ref={bestandRef}
                type="file" accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBestand(file);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => bestandRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 16px', borderRadius: 12,
                  background: 'var(--card)', boxShadow: 'var(--shadow)',
                  color: 'var(--text)', fontSize: 14, fontWeight: 500,
                  width: '100%', textAlign: 'left',
                }}
              >
                <FileText size={18} color="var(--olive)" />
                JSON-bestand kiezen
              </button>

              {/* Tekst plakken */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Of plak JSON hier
                </label>
                <textarea
                  placeholder={'[\n  {\n    "titel": "Pasta Bolognese",\n    "ingredienten": [...],\n    ...\n  }\n]'}
                  value={jsonTekst}
                  onChange={(e) => setJsonTekst(e.target.value)}
                  rows={6}
                  style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--card)', fontSize: 12,
                    fontFamily: 'monospace', color: 'var(--text)',
                    outline: 'none', resize: 'vertical', width: '100%',
                  }}
                />
              </div>

              {importError && (
                <p style={{ color: 'var(--crimson)', fontSize: 13 }}>{importError}</p>
              )}

              <button
                onClick={() => verwerkJson(jsonTekst)}
                disabled={!jsonTekst.trim()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 12,
                  background: jsonTekst.trim() ? 'var(--cobalt)' : 'rgba(26,26,46,0.08)',
                  color: jsonTekst.trim() ? '#fff' : 'var(--text-muted)',
                  fontSize: 14, fontWeight: 700,
                  boxShadow: jsonTekst.trim() ? '0 3px 12px rgba(27,63,160,0.25)' : 'none',
                }}
              >
                <CheckCircle size={16} weight="duotone" />
                Controleer JSON
              </button>
            </div>
          )}

          {importStatus === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>
                  {importRecepten.length} recept{importRecepten.length !== 1 ? 'en' : ''} gevonden
                </span>
                <button
                  onClick={toggleAlles}
                  style={{ fontSize: 12, color: 'var(--cobalt)', fontWeight: 600 }}
                >
                  {geselecteerd.size === importRecepten.length ? 'Deselecteer alles' : 'Selecteer alles'}
                </button>
                <button onClick={resetImport} style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Lijst */}
              <div style={{ background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                {importRecepten.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSelectie(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 14px', width: '100%', textAlign: 'left',
                      borderBottom: i < importRecepten.length - 1 ? '1px solid rgba(26,26,46,0.06)' : 'none',
                      background: geselecteerd.has(i) ? 'rgba(27,63,160,0.05)' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: geselecteerd.has(i) ? 'none' : '2px solid rgba(26,26,46,0.18)',
                      background: geselecteerd.has(i) ? 'var(--cobalt)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s',
                    }}>
                      {geselecteerd.has(i) && <Check size={13} color="#fff" weight="bold" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                        {r.titel || '(naamloos)'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {r.ingredienten.length} ingrediënt{r.ingredienten.length !== 1 ? 'en' : ''}
                        {r.keuken ? ` · ${r.keuken}` : ''}
                        {r.bereidingstijd > 0 ? ` · ${r.bereidingstijd} min` : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Importeer knop */}
              <button
                onClick={handleImport}
                disabled={geselecteerd.size === 0}
                style={{
                  padding: '13px', borderRadius: 12,
                  background: geselecteerd.size > 0 ? 'var(--cobalt)' : 'rgba(26,26,46,0.08)',
                  color: geselecteerd.size > 0 ? '#fff' : 'var(--text-muted)',
                  fontSize: 15, fontWeight: 700,
                  boxShadow: geselecteerd.size > 0 ? '0 3px 12px rgba(27,63,160,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Upload size={16} weight="duotone" />
                Importeer {geselecteerd.size} recept{geselecteerd.size !== 1 ? 'en' : ''}
              </button>
            </div>
          )}

          {importStatus === 'importing' && (
            <div style={{
              padding: '24px', background: 'var(--card)', borderRadius: 14,
              boxShadow: 'var(--shadow)', textAlign: 'center',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--cobalt)', margin: '0 auto 12px',
                animation: 'pulse 1.2s ease-in-out infinite',
              }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Recepten importeren…
              </p>
              <style>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 0.7; }
                  50% { transform: scale(1.12); opacity: 1; }
                }
              `}</style>
            </div>
          )}

          {importStatus === 'done' && (
            <div style={{
              padding: '20px', background: 'var(--card)', borderRadius: 14,
              boxShadow: 'var(--shadow)', textAlign: 'center',
              display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'var(--olive)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={26} color="#fff" weight="bold" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  {importSucces} recept{importSucces !== 1 ? 'en' : ''} geïmporteerd
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  De recepten zijn zichtbaar in de Recepten-tab.
                </p>
              </div>
              <button
                onClick={resetImport}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: 'rgba(26,26,46,0.06)',
                  fontSize: 13, color: 'var(--text)',
                }}
              >
                Nog een import
              </button>
            </div>
          )}
        </SettingsSection>

        {/* Over */}
        <SettingsSection title="Over">
          <div style={{ background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <SettingsRow label="App" value="Smakelijk" />
            <SettingsRow label="Versie" value="1.0.0" />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cobalt)' }}>
        {icon}
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
          {title}
        </h3>
        <div style={{ flex: 1, height: 1, background: 'rgba(27,63,160,0.12)', marginLeft: 4 }} />
      </div>
      {children}
    </section>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 14px', borderBottom: '1px solid rgba(26,26,46,0.06)',
    }}>
      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
