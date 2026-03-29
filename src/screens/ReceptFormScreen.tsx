import { useState, useRef } from 'react';
import { ArrowLeft, Plus, Trash, Link, Camera, FileText, Spinner, MagicWand, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Recept, Ingredient, Eenheid, ReceptType, Moeilijkheid } from '../types';
import { useRecepten } from '../context/ReceptenContext';
import {
  parseReceptFromUrl, parseReceptFromImages, parseIngredienten,
  splitStappen, compressImage, legeIngredient, leegRecept, bepaalMoeilijkheid,
} from '../services/ai';

type FormTab = 'handmatig' | 'url' | 'foto';
type InvoerModus = 'tekst' | 'gestructureerd';

interface Props {
  recept?: Recept;
  onBack: () => void;
  onSaved: (receptId: string) => void;
}

const EENHEDEN: (Eenheid | string)[] = [
  'gram', 'kg', 'ml', 'liter', 'stuks', 'el', 'tl', 'snuf',
  'pak', 'blik', 'teen', 'takje', 'blad',
];

const KEUKENS = [
  'Italiaans', 'Mexicaans', 'Aziatisch', 'Nederlands', 'Frans',
  'Grieks', 'Indiaas', 'Thais', 'Japans', 'Arabisch', 'Anders',
];

export default function ReceptFormScreen({ recept: bestaandRecept, onBack, onSaved }: Props) {
  const { addRecept, updateRecept } = useRecepten();
  const [activeTab, setActiveTab] = useState<FormTab>('handmatig');
  const [form, setForm] = useState<Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor'>>(
    bestaandRecept ?? leegRecept()
  );
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Ingrediënten invoermodus
  const heeftBestaandeIngredienten = !!bestaandRecept && bestaandRecept.ingredienten.length > 0;
  const [ingModus, setIngModus] = useState<InvoerModus>(heeftBestaandeIngredienten ? 'gestructureerd' : 'tekst');
  const [ingTekst, setIngTekst] = useState('');
  const [ingLoading, setIngLoading] = useState(false);
  const [ingError, setIngError] = useState('');

  // Bereiding invoermodus
  const heeftBestaandeBereiding = !!bestaandRecept && bestaandRecept.bereiding.length > 0;
  const [berModus, setBerModus] = useState<InvoerModus>(heeftBestaandeBereiding ? 'gestructureerd' : 'tekst');
  const [berTekst, setBerTekst] = useState('');

  const setField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.titel.trim()) return;
    setSaving(true);
    try {
      if (bestaandRecept) {
        await updateRecept(bestaandRecept.id, form);
        onSaved(bestaandRecept.id);
      } else {
        const id = await addRecept(form);
        onSaved(id);
      }
    } finally {
      setSaving(false);
    }
  };

  const applyAiResult = (data: Partial<Omit<Recept, 'id' | 'aangemaakt' | 'toegevoegdDoor'>>) => {
    setForm((f) => ({
      ...f, ...data,
      moeilijkheid: bepaalMoeilijkheid(data.bereidingstijd ?? f.bereidingstijd),
      favoriet: f.favoriet, laatstGemaakt: f.laatstGemaakt,
    }));
    if (data.ingredienten && data.ingredienten.length > 0) setIngModus('gestructureerd');
    if (data.bereiding && data.bereiding.length > 0) setBerModus('gestructureerd');
    setActiveTab('handmatig');
  };

  const handleUrlParse = async () => {
    if (!urlInput.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const result = await parseReceptFromUrl(urlInput.trim());
      if (result) applyAiResult({ ...result, bronUrl: urlInput.trim() });
      else setAiError('Kon het recept niet ophalen. Probeer een andere URL of voer het handmatig in.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFotosVerwerken = async (files: File[]) => {
    if (files.length === 0) return;
    setAiLoading(true);
    setAiError('');
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      const result = await parseReceptFromImages(compressed);
      if (result) applyAiResult(result);
      else setAiError('Kon het recept niet lezen. Zorg voor scherpe, goed verlichte foto\'s waarop de tekst goed leesbaar is.');
    } catch {
      setAiError('Er ging iets mis bij het verwerken van de foto\'s.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleParseIngredienten = async () => {
    if (!ingTekst.trim()) return;
    setIngLoading(true);
    setIngError('');
    try {
      const result = await parseIngredienten(ingTekst);
      if (result && result.length > 0) {
        setField('ingredienten', result);
        setIngModus('gestructureerd');
      } else {
        setIngError('Kon de ingrediënten niet verwerken. Controleer de invoer.');
      }
    } finally {
      setIngLoading(false);
    }
  };

  const handleSplitBereiding = () => {
    const stappen = splitStappen(berTekst);
    if (stappen.length > 0) {
      setField('bereiding', stappen);
      setBerModus('gestructureerd');
    }
  };

  const updateIngredient = (i: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...form.ingredienten];
    updated[i] = { ...updated[i], [field]: field === 'hoeveelheid' ? Number(value) : value };
    setField('ingredienten', updated);
  };

  const removeIngredient = (i: number) => setField('ingredienten', form.ingredienten.filter((_, idx) => idx !== i));
  const addIngredient = () => setField('ingredienten', [...form.ingredienten, legeIngredient()]);

  const updateStap = (i: number, value: string) => {
    const updated = [...form.bereiding];
    updated[i] = value;
    setField('bereiding', updated);
  };
  const removeStap = (i: number) => setField('bereiding', form.bereiding.filter((_, idx) => idx !== i));
  const addStap = () => setField('bereiding', [...form.bereiding, '']);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setField('tags', [...form.tags, t]);
    setTagInput('');
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--card)', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{ color: 'var(--text)', display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 22, flex: 1 }}>
          {bestaandRecept ? 'Recept bewerken' : 'Recept toevoegen'}
        </h2>
        <button
          onClick={handleSave}
          disabled={!form.titel.trim() || saving}
          style={{
            padding: '8px 16px', borderRadius: 10,
            background: form.titel.trim() ? 'var(--cobalt)' : 'rgba(26,26,46,0.12)',
            color: form.titel.trim() ? '#fff' : 'var(--text-muted)',
            fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
          }}
        >
          {saving ? 'Opslaan…' : 'Opslaan'}
        </button>
      </div>

      {/* Methode tabs (alleen bij nieuw recept) */}
      {!bestaandRecept && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{
            display: 'flex', background: 'rgba(26,26,46,0.06)',
            borderRadius: 12, padding: 4, gap: 2,
          }}>
            {([
              { id: 'handmatig', icon: <FileText size={14} />, label: 'Handmatig' },
              { id: 'url', icon: <Link size={14} />, label: 'URL' },
              { id: 'foto', icon: <Camera size={14} />, label: 'Foto' },
            ] as const).map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setAiError(''); }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '8px 6px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                  background: activeTab === id ? 'var(--card)' : 'transparent',
                  color: activeTab === id ? 'var(--text)' : 'var(--text-secondary)',
                  boxShadow: activeTab === id ? 'var(--shadow)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL tab */}
      {activeTab === 'url' && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Plak de URL van een recept. De AI haalt de ingrediënten en bereiding op.
          </p>
          <input
            type="url" placeholder="https://..."
            value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            style={inputStyle}
          />
          {aiError && <p style={{ color: 'var(--crimson)', fontSize: 13 }}>{aiError}</p>}
          <button
            onClick={handleUrlParse}
            disabled={!urlInput.trim() || aiLoading}
            style={aiButtonStyle(aiLoading)}
          >
            {aiLoading
              ? <><Spinner size={16} style={spinStyle} /> Bezig…</>
              : <><MagicWand size={16} /> Recept ophalen</>
            }
          </button>
        </div>
      )}

      {/* Foto tab */}
      {activeTab === 'foto' && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Selecteer één of meerdere foto's (bijv. twee pagina's van een kookboek). De AI verwerkt ze samen als één recept.
          </p>
          {aiError && <p style={{ color: 'var(--crimson)', fontSize: 13 }}>{aiError}</p>}

          <input
            ref={fileInputRef}
            type="file" accept="image/*" multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) setFotoFiles(files);
              e.target.value = '';
            }}
          />

          {/* Foto selectie knop */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={aiLoading}
            style={{
              padding: '28px 20px', borderRadius: 16,
              border: `2px dashed ${fotoFiles.length > 0 ? 'var(--olive)' : 'rgba(26,26,46,0.15)'}`,
              background: fotoFiles.length > 0 ? 'rgba(123,140,82,0.06)' : 'var(--card)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              color: 'var(--text-secondary)', transition: 'all 0.15s',
            }}
          >
            <Camera size={26} color={fotoFiles.length > 0 ? 'var(--olive)' : 'var(--text-muted)'} />
            <span style={{ fontSize: 14, color: fotoFiles.length > 0 ? 'var(--olive)' : 'var(--text-secondary)', fontWeight: fotoFiles.length > 0 ? 600 : 400 }}>
              {fotoFiles.length > 0
                ? `${fotoFiles.length} foto${fotoFiles.length > 1 ? "'s" : ''} geselecteerd`
                : "Foto's kiezen of maken"}
            </span>
            <span style={{ fontSize: 12, color: '#B0AAA3' }}>
              {fotoFiles.length > 0 ? 'Tik om foto\'s te wijzigen' : 'Meerdere selectie mogelijk'}
            </span>
          </button>

          {/* Thumbnails */}
          {fotoFiles.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {fotoFiles.map((file, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Foto ${i + 1}`}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--olive)' }}
                  />
                  <button
                    onClick={() => setFotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--cobalt)', color: '#fff',
                      fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Verwerk knop */}
          <button
            onClick={() => handleFotosVerwerken(fotoFiles)}
            disabled={fotoFiles.length === 0 || aiLoading}
            style={{
              ...aiButtonStyle(aiLoading),
              opacity: fotoFiles.length === 0 ? 0.4 : aiLoading ? 0.7 : 1,
            }}
          >
            {aiLoading
              ? <><Spinner size={16} style={spinStyle} /> Verwerken… (10–20 sec)</>
              : <><MagicWand size={16} /> {fotoFiles.length > 1 ? `Verwerk ${fotoFiles.length} foto's` : 'Verwerk foto'}</>
            }
          </button>

          <div style={{ background: 'rgba(212,168,67,0.1)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(212,168,67,0.3)' }}>
            <p style={{ fontSize: 12, color: '#7A5A00' }}>
              <strong>Tips:</strong> fotografeer plat en recht, zorg voor voldoende licht, en zorg dat alle tekst volledig in beeld is. Bij een recept op twee pagina's: maak twee aparte foto's.
            </p>
          </div>
        </div>
      )}

      {/* Handmatig formulier */}
      {activeTab === 'handmatig' && (
        <div style={{ padding: '16px 20px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basis */}
          <FormSection title="Basis">
            <input
              type="text" placeholder="Naam van het recept"
              value={form.titel} onChange={(e) => setField('titel', e.target.value)}
              style={{ ...inputStyle, fontWeight: 600, fontSize: 16 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              {(['hoofdgerecht', 'overig'] as ReceptType[]).map((t) => (
                <button
                  key={t} onClick={() => setField('type', t)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 10, fontSize: 13,
                    background: form.type === t ? 'var(--cobalt)' : 'rgba(26,26,46,0.06)',
                    color: form.type === t ? '#fff' : 'var(--text)', fontWeight: 500,
                  }}
                >
                  {t === 'hoofdgerecht' ? 'Hoofdgerecht' : 'Overig'}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <LabeledInput label="Bereidingstijd (min)">
                <input
                  type="number" min="0"
                  value={form.bereidingstijd || ''}
                  onChange={(e) => {
                    const tijd = Number(e.target.value);
                    setForm((f) => ({ ...f, bereidingstijd: tijd, moeilijkheid: bepaalMoeilijkheid(tijd) }));
                  }}
                  style={inputStyle}
                />
              </LabeledInput>
              <LabeledInput label="Porties">
                <input
                  type="number" min="1"
                  value={form.porties || ''}
                  onChange={(e) => setField('porties', Number(e.target.value))}
                  style={inputStyle}
                />
              </LabeledInput>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <LabeledInput label="Keuken">
                <select
                  value={form.keuken} onChange={(e) => setField('keuken', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="">Kies…</option>
                  {KEUKENS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </LabeledInput>
              <LabeledInput label="Moeilijkheid">
                <select
                  value={form.moeilijkheid}
                  onChange={(e) => setField('moeilijkheid', e.target.value as Moeilijkheid)}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="doordeweeks">Doordeweeks</option>
                  <option value="weekend">Weekend</option>
                </select>
              </LabeledInput>
            </div>
          </FormSection>

          {/* ── Ingrediënten ── */}
          <FormSection title="Ingrediënten">
            {ingModus === 'tekst' ? (
              <>
                <textarea
                  placeholder={'Plak of typ de ingrediënten, bijv.:\n500 gram gehakt\n2 uien\n1 blik tomaten\n400 ml bouillon'}
                  value={ingTekst}
                  onChange={(e) => setIngTekst(e.target.value)}
                  rows={6}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                {ingError && <p style={{ color: 'var(--crimson)', fontSize: 13 }}>{ingError}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleParseIngredienten}
                    disabled={!ingTekst.trim() || ingLoading}
                    style={{
                      ...aiButtonStyle(ingLoading),
                      flex: 1,
                      opacity: !ingTekst.trim() ? 0.5 : 1,
                    }}
                  >
                    {ingLoading
                      ? <><Spinner size={15} style={spinStyle} /> Verwerken…</>
                      : <><MagicWand size={15} /> Verwerk met AI</>
                    }
                  </button>
                  {form.ingredienten.length > 0 && (
                    <button
                      onClick={() => setIngModus('gestructureerd')}
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(26,26,46,0.06)', fontSize: 13, color: 'var(--text)',
                      }}
                    >
                      Toon lijst
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {form.ingredienten.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="number" min="0" step="0.1" placeholder="0"
                      value={ing.hoeveelheid || ''}
                      onChange={(e) => updateIngredient(i, 'hoeveelheid', e.target.value)}
                      style={{ ...inputStyle, width: 60, flexShrink: 0, padding: '10px 8px', textAlign: 'center' }}
                    />
                    <select
                      value={ing.eenheid}
                      onChange={(e) => updateIngredient(i, 'eenheid', e.target.value)}
                      style={{ ...inputStyle, width: 70, flexShrink: 0, padding: '10px 6px', appearance: 'none' }}
                    >
                      {EENHEDEN.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <input
                      type="text" placeholder="Ingrediënt"
                      value={ing.naam}
                      onChange={(e) => updateIngredient(i, 'naam', e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={() => removeIngredient(i)} style={{ color: '#C0BAB3', flexShrink: 0 }}>
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={addIngredient}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px', borderRadius: 10,
                      border: '1.5px dashed rgba(26,26,46,0.15)',
                      color: 'var(--cobalt)', fontSize: 13, fontWeight: 500,
                    }}
                  >
                    <Plus size={15} /> Rij toevoegen
                  </button>
                  <button
                    onClick={() => { setIngTekst(''); setIngModus('tekst'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 14px', borderRadius: 10,
                      color: 'var(--text-muted)', fontSize: 13,
                      border: '1px solid rgba(26,26,46,0.10)',
                    }}
                  >
                    <ArrowCounterClockwise size={13} /> Opnieuw invoeren
                  </button>
                </div>
              </>
            )}
          </FormSection>

          {/* ── Bereiding ── */}
          <FormSection title="Bereiding">
            {berModus === 'tekst' ? (
              <>
                <textarea
                  placeholder={'Plak of typ de bereiding. De app splitst dit automatisch in stappen.\n\nVoorbeeld:\nVerhit olie in een pan. Fruit de ui glazig. Voeg het gehakt toe en bak bruin.\n\nOf gebruik nummers:\n1. Verhit olie\n2. Fruit de ui\n3. Voeg gehakt toe'}
                  value={berTekst}
                  onChange={(e) => setBerTekst(e.target.value)}
                  rows={8}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSplitBereiding}
                    disabled={!berTekst.trim()}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 14px', borderRadius: 10,
                      background: berTekst.trim() ? 'var(--cobalt)' : 'rgba(26,26,46,0.08)',
                      color: berTekst.trim() ? '#fff' : 'var(--text-muted)',
                      fontSize: 13, fontWeight: 600,
                      opacity: !berTekst.trim() ? 0.5 : 1,
                    }}
                  >
                    <MagicWand size={15} /> Splits in stappen
                  </button>
                  {form.bereiding.length > 0 && (
                    <button
                      onClick={() => setBerModus('gestructureerd')}
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(26,26,46,0.06)', fontSize: 13, color: 'var(--text)',
                      }}
                    >
                      Toon stappen
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {form.bereiding.map((stap, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                      background: 'var(--cobalt)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 10,
                    }}>
                      {i + 1}
                    </div>
                    <textarea
                      placeholder={`Stap ${i + 1}…`}
                      value={stap}
                      onChange={(e) => updateStap(i, e.target.value)}
                      rows={2}
                      style={{ ...inputStyle, flex: 1, resize: 'vertical' }}
                    />
                    <button onClick={() => removeStap(i)} style={{ color: '#C0BAB3', marginTop: 10, flexShrink: 0 }}>
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={addStap}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px', borderRadius: 10,
                      border: '1.5px dashed rgba(26,26,46,0.15)',
                      color: 'var(--cobalt)', fontSize: 13, fontWeight: 500,
                    }}
                  >
                    <Plus size={15} /> Stap toevoegen
                  </button>
                  <button
                    onClick={() => { setBerTekst(''); setBerModus('tekst'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 14px', borderRadius: 10,
                      color: 'var(--text-muted)', fontSize: 13,
                      border: '1px solid rgba(26,26,46,0.10)',
                    }}
                  >
                    <ArrowCounterClockwise size={13} /> Opnieuw invoeren
                  </button>
                </div>
              </>
            )}
          </FormSection>

          {/* Tags */}
          <FormSection title="Tags">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" placeholder="Tag toevoegen…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addTag}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--olive)', color: '#fff', fontWeight: 500, fontSize: 13,
                }}
              >
                Toevoegen
              </button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setField('tags', form.tags.filter((t) => t !== tag))}
                    style={{
                      padding: '5px 10px', borderRadius: 8,
                      background: 'rgba(26,26,46,0.08)',
                      fontSize: 13, color: 'var(--text)',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {tag} <span style={{ color: 'var(--text-muted)' }}>×</span>
                  </button>
                ))}
              </div>
            )}
          </FormSection>

          {/* Extra */}
          <FormSection title="Extra">
            <LabeledInput label="Notities">
              <textarea
                placeholder="Persoonlijke notities, variaties…"
                value={form.notities}
                onChange={(e) => setField('notities', e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </LabeledInput>
            <LabeledInput label="Bronlink (URL)">
              <input
                type="url" placeholder="https://…"
                value={form.bronUrl}
                onChange={(e) => setField('bronUrl', e.target.value)}
                style={inputStyle}
              />
            </LabeledInput>
          </FormSection>
        </div>
      )}

    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: 'var(--text)', marginBottom: 2 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function LabeledInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid rgba(26,26,46,0.10)',
  background: 'var(--card)', fontSize: 14, color: 'var(--text)',
  outline: 'none', width: '100%',
};

const spinStyle: React.CSSProperties = { animation: 'spin 1s linear infinite' };

function aiButtonStyle(loading: boolean): React.CSSProperties {
  return {
    padding: '11px 16px', borderRadius: 10,
    background: 'var(--cobalt)', color: '#fff',
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: loading ? 0.7 : 1,
  };
}
