import { useState, useRef } from 'react';
import { LogOut, Copy, Check, Users, Upload, FileJson, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { useRecepten } from '../context/ReceptenContext';
import { Recept, ReceptType, Moeilijkheid } from '../types';

// ── JSON import types ────────────────────────────────────────────
type ImportRecept = Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor' | 'favoriet' | 'laatstGemaakt'>;

function normaliseerRecept(raw: Record<string, unknown>): ImportRecept {
  return {
    titel: String(raw.titel ?? ''),
    type: (['hoofdgerecht', 'overig'].includes(raw.type as string)
      ? raw.type : 'hoofdgerecht') as ReceptType,
    ingredienten: Array.isArray(raw.ingredienten)
      ? (raw.ingredienten as Record<string, unknown>[]).map((ing) => ({
          hoeveelheid: Number(ing.hoeveelheid ?? 0),
          eenheid: String(ing.eenheid ?? 'stuks'),
          naam: String(ing.naam ?? ''),
        }))
      : [],
    bereiding: Array.isArray(raw.bereiding)
      ? (raw.bereiding as unknown[]).map(String)
      : [],
    keuken: String(raw.keuken ?? ''),
    moeilijkheid: (['doordeweeks', 'weekend'].includes(raw.moeilijkheid as string)
      ? raw.moeilijkheid : 'doordeweeks') as Moeilijkheid,
    bereidingstijd: Number(raw.bereidingstijd ?? 30),
    porties: Number(raw.porties ?? 4),
    tags: Array.isArray(raw.tags) ? (raw.tags as unknown[]).map(String) : [],
    notities: String(raw.notities ?? ''),
    bronUrl: String(raw.bronUrl ?? ''),
    favoriet: false,
    laatstGemaakt: null,
  };
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
      typeof r === 'object' && r !== null && 'titel' in r
  );
  if (objects.length === 0) return "Geen geldige recepten gevonden (elk recept heeft een 'titel' nodig).";
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
    const result = parseImportJson(tekst);
    if (typeof result === 'string') {
      setImportError(result);
      return;
    }
    setImportRecepten(result);
    setGeselecteerd(new Set(result.map((_, i) => i)));
    setImportStatus('preview');
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
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '20px 20px 8px' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 32, marginBottom: 4 }}>
          Instellingen
        </h1>
      </div>

      <div style={{ padding: '8px 20px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Account */}
        <SettingsSection title="Account">
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
              <div style={{ fontSize: 13, color: '#7A7570', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              color: 'var(--accent1)', fontSize: 14, fontWeight: 500,
              width: '100%', textAlign: 'left',
            }}
          >
            <LogOut size={18} />
            Uitloggen
          </button>
        </SettingsSection>

        {/* Huishouden */}
        {household && (
          <SettingsSection title="Huishouden">
            <div style={{ background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <SettingsRow label="Naam" value={household.naam} />
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid rgba(45,42,38,0.06)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#A09A93', marginBottom: 2 }}>Uitnodigingscode</div>
                  <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 4, color: 'var(--accent1)' }}>
                    {household.code}
                  </div>
                </div>
                <button
                  onClick={copyCode}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: codeCopied ? 'var(--accent2)' : 'rgba(45,42,38,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: codeCopied ? '#fff' : '#7A7570', transition: 'all 0.2s',
                  }}
                >
                  {codeCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={16} color="#A09A93" />
                <span style={{ fontSize: 14, color: '#7A7570' }}>
                  {household.leden.length} lid{household.leden.length !== 1 ? 'en' : ''}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#A09A93', textAlign: 'center' }}>
              Deel de code met huisgenoten om samen recepten te beheren.
            </p>
          </SettingsSection>
        )}

        {/* ── Recepten importeren ── */}
        <SettingsSection title="Importeren">
          {importStatus === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#7A7570', lineHeight: 1.5 }}>
                Importeer recepten vanuit een JSON-bestand of plak JSON rechtstreeks.
              </p>

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
                <FileJson size={18} color="var(--accent2)" />
                JSON-bestand kiezen
              </button>

              {/* Tekst plakken */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#A09A93', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  Of plak JSON hier
                </label>
                <textarea
                  placeholder={'[\n  {\n    "titel": "Pasta Bolognese",\n    "ingredienten": [...],\n    ...\n  }\n]'}
                  value={jsonTekst}
                  onChange={(e) => setJsonTekst(e.target.value)}
                  rows={6}
                  style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid rgba(45,42,38,0.10)',
                    background: 'var(--card)', fontSize: 12,
                    fontFamily: 'monospace', color: 'var(--text)',
                    outline: 'none', resize: 'vertical', width: '100%',
                  }}
                />
              </div>

              {importError && (
                <p style={{ color: 'var(--accent1)', fontSize: 13 }}>{importError}</p>
              )}

              <button
                onClick={() => verwerkJson(jsonTekst)}
                disabled={!jsonTekst.trim()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 12,
                  background: jsonTekst.trim() ? 'var(--accent2)' : 'rgba(45,42,38,0.08)',
                  color: jsonTekst.trim() ? '#fff' : '#A09A93',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                <Upload size={16} />
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
                  style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 500 }}
                >
                  {geselecteerd.size === importRecepten.length ? 'Deselecteer alles' : 'Selecteer alles'}
                </button>
                <button onClick={resetImport} style={{ color: '#A09A93', display: 'flex' }}>
                  <X size={18} />
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
                      borderBottom: i < importRecepten.length - 1 ? '1px solid rgba(45,42,38,0.06)' : 'none',
                      background: geselecteerd.has(i) ? 'rgba(123,140,82,0.05)' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: geselecteerd.has(i) ? 'none' : '2px solid rgba(45,42,38,0.20)',
                      background: geselecteerd.has(i) ? 'var(--accent2)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s',
                    }}>
                      {geselecteerd.has(i) && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                        {r.titel || '(naamloos)'}
                      </div>
                      <div style={{ fontSize: 12, color: '#A09A93' }}>
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
                  background: geselecteerd.size > 0 ? 'var(--accent2)' : 'rgba(45,42,38,0.08)',
                  color: geselecteerd.size > 0 ? '#fff' : '#A09A93',
                  fontSize: 15, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Upload size={16} />
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
                background: 'var(--accent2)', margin: '0 auto 12px',
                animation: 'pulse 1.2s ease-in-out infinite',
              }} />
              <p style={{ fontSize: 14, color: '#7A7570' }}>
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
                width: 48, height: 48, borderRadius: 14, background: 'var(--accent2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={26} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  {importSucces} recept{importSucces !== 1 ? 'en' : ''} geïmporteerd
                </p>
                <p style={{ fontSize: 13, color: '#7A7570' }}>
                  De recepten zijn zichtbaar in de Recepten-tab.
                </p>
              </div>
              <button
                onClick={resetImport}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: 'rgba(45,42,38,0.06)',
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

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, color: '#A09A93', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 14px', borderBottom: '1px solid rgba(45,42,38,0.06)',
    }}>
      <span style={{ fontSize: 14, color: '#7A7570' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
