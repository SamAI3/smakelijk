import { useState, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Link, Camera, FileText, Loader } from 'lucide-react';
import { Recept, Ingredient, Eenheid, ReceptType, Moeilijkheid } from '../types';
import { useRecepten } from '../context/ReceptenContext';
import { parseReceptFromUrl, parseReceptFromImage, legeIngredient, leegRecept } from '../services/ai';

type FormTab = 'handmatig' | 'url' | 'foto';

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
  const [tagInput, setTagInput] = useState('');

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
    setForm((f) => ({ ...f, ...data, favoriet: f.favoriet, laatstGemaakt: f.laatstGemaakt }));
    setActiveTab('handmatig');
  };

  const handleUrlParse = async () => {
    if (!urlInput.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const result = await parseReceptFromUrl(urlInput.trim());
      if (result) {
        applyAiResult({ ...result, bronUrl: urlInput.trim() });
      } else {
        setAiError('Kon het recept niet ophalen. Probeer een andere URL of voer het handmatig in.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageCapture = async (file: File) => {
    setAiLoading(true);
    setAiError('');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Full = e.target?.result as string;
        const base64 = base64Full.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        const result = await parseReceptFromImage(base64, mimeType);
        if (result) {
          applyAiResult(result);
        } else {
          setAiError('Kon het recept niet lezen. Probeer een duidelijkere foto.');
        }
        setAiLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setAiError('Er ging iets mis bij het verwerken van de foto.');
      setAiLoading(false);
    }
  };

  const updateIngredient = (i: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...form.ingredienten];
    updated[i] = { ...updated[i], [field]: field === 'hoeveelheid' ? Number(value) : value };
    setField('ingredienten', updated);
  };

  const removeIngredient = (i: number) => {
    setField('ingredienten', form.ingredienten.filter((_, idx) => idx !== i));
  };

  const addIngredient = () => {
    setField('ingredienten', [...form.ingredienten, legeIngredient()]);
  };

  const updateStap = (i: number, value: string) => {
    const updated = [...form.bereiding];
    updated[i] = value;
    setField('bereiding', updated);
  };

  const removeStap = (i: number) => {
    setField('bereiding', form.bereiding.filter((_, idx) => idx !== i));
  };

  const addStap = () => {
    setField('bereiding', [...form.bereiding, '']);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setField('tags', [...form.tags, t]);
    }
    setTagInput('');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
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
            background: form.titel.trim() ? 'var(--accent1)' : 'rgba(45,42,38,0.12)',
            color: form.titel.trim() ? '#fff' : '#A09A93',
            fontSize: 14, fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >
          {saving ? 'Opslaan…' : 'Opslaan'}
        </button>
      </div>

      {/* Methode tabs (alleen bij nieuw recept) */}
      {!bestaandRecept && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(45,42,38,0.06)',
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
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '8px 6px',
                  borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  background: activeTab === id ? 'var(--card)' : 'transparent',
                  color: activeTab === id ? 'var(--text)' : '#7A7570',
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
          <p style={{ fontSize: 14, color: '#7A7570' }}>
            Plak de URL van een recept. De AI haalt de ingrediënten en bereiding op.
          </p>
          <input
            type="url"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={inputStyle}
          />
          {aiError && <p style={{ color: 'var(--accent1)', fontSize: 13 }}>{aiError}</p>}
          <button
            onClick={handleUrlParse}
            disabled={!urlInput.trim() || aiLoading}
            style={{
              padding: '12px', borderRadius: 12,
              background: 'var(--accent1)', color: '#fff',
              fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: aiLoading ? 0.7 : 1,
            }}
          >
            {aiLoading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Bezig…</> : 'Recept ophalen'}
          </button>
        </div>
      )}

      {/* Foto tab */}
      {activeTab === 'foto' && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: '#7A7570' }}>
            Maak een foto van een recept of kies er een uit je bibliotheek.
          </p>
          {aiError && <p style={{ color: 'var(--accent1)', fontSize: 13 }}>{aiError}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageCapture(file);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={aiLoading}
            style={{
              padding: '40px 20px', borderRadius: 16,
              border: '2px dashed rgba(45,42,38,0.15)',
              background: 'var(--card)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              color: '#7A7570',
            }}
          >
            {aiLoading
              ? <><Loader size={28} style={{ animation: 'spin 1s linear infinite' }} /><span>Verwerken…</span></>
              : <><Camera size={28} /><span style={{ fontSize: 14 }}>Foto maken of kiezen</span></>
            }
          </button>
        </div>
      )}

      {/* Handmatig formulier */}
      {activeTab === 'handmatig' && (
        <div style={{ padding: '16px 20px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basis */}
          <FormSection title="Basis">
            <input
              type="text"
              placeholder="Naam van het recept"
              value={form.titel}
              onChange={(e) => setField('titel', e.target.value)}
              style={{ ...inputStyle, fontWeight: 600, fontSize: 16 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              {(['hoofdgerecht', 'overig'] as ReceptType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setField('type', t)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 10, fontSize: 13,
                    background: form.type === t ? 'var(--accent1)' : 'rgba(45,42,38,0.06)',
                    color: form.type === t ? '#fff' : 'var(--text)',
                    fontWeight: 500,
                  }}
                >
                  {t === 'hoofdgerecht' ? 'Hoofdgerecht' : 'Overig'}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <LabeledInput label="Bereidingstijd (min)">
                <input
                  type="number"
                  min="0"
                  value={form.bereidingstijd || ''}
                  onChange={(e) => setField('bereidingstijd', Number(e.target.value))}
                  style={inputStyle}
                />
              </LabeledInput>
              <LabeledInput label="Porties">
                <input
                  type="number"
                  min="1"
                  value={form.porties || ''}
                  onChange={(e) => setField('porties', Number(e.target.value))}
                  style={inputStyle}
                />
              </LabeledInput>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <LabeledInput label="Keuken">
                <select
                  value={form.keuken}
                  onChange={(e) => setField('keuken', e.target.value)}
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

          {/* Ingrediënten */}
          <FormSection title="Ingrediënten">
            {form.ingredienten.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
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
                  type="text"
                  placeholder="Ingrediënt"
                  value={ing.naam}
                  onChange={(e) => updateIngredient(i, 'naam', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={() => removeIngredient(i)} style={{ color: '#C0BAB3', flexShrink: 0 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                border: '1.5px dashed rgba(45,42,38,0.15)',
                color: 'var(--accent1)', fontSize: 14, fontWeight: 500,
                background: 'transparent',
              }}
            >
              <Plus size={16} /> Ingrediënt toevoegen
            </button>
          </FormSection>

          {/* Bereiding */}
          <FormSection title="Bereiding">
            {form.bereiding.map((stap, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                  background: 'var(--accent1)', display: 'flex', alignItems: 'center',
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
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addStap}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                border: '1.5px dashed rgba(45,42,38,0.15)',
                color: 'var(--accent1)', fontSize: 14, fontWeight: 500,
                background: 'transparent',
              }}
            >
              <Plus size={16} /> Stap toevoegen
            </button>
          </FormSection>

          {/* Tags */}
          <FormSection title="Tags">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Tag toevoegen…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addTag}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--accent2)', color: '#fff', fontWeight: 500, fontSize: 13,
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
                      background: 'rgba(45,42,38,0.08)',
                      fontSize: 13, color: 'var(--text)',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {tag} <span style={{ color: '#A09A93' }}>×</span>
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
                type="url"
                placeholder="https://…"
                value={form.bronUrl}
                onChange={(e) => setField('bronUrl', e.target.value)}
                style={inputStyle}
              />
            </LabeledInput>
          </FormSection>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{
        fontFamily: 'var(--font-title)', fontSize: 18,
        color: 'var(--text)', marginBottom: 2,
      }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function LabeledInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#7A7570', textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1.5px solid rgba(45,42,38,0.10)',
  background: 'var(--card)',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
};
