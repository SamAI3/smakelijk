import { useState } from 'react';
import { useHousehold } from '../context/HouseholdContext';

export default function OnboardingScreen() {
  const { createHousehold, joinHousehold } = useHousehold();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [naam, setNaam] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!naam.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createHousehold(naam.trim());
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (code.trim().length !== 6) {
      setError('Voer een geldige 6-tekens code in.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ok = await joinHousehold(code.trim());
      if (!ok) setError('Code niet gevonden. Controleer en probeer opnieuw.');
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      gap: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 28, marginBottom: 8 }}>
          Jouw huishouden
        </h2>
        <p style={{ color: '#7A7570', fontSize: 14 }}>
          Recepten deel je met je huishouden.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: 'rgba(45,42,38,0.06)',
        borderRadius: 12,
        padding: 4,
        width: '100%',
        maxWidth: 320,
      }}>
        {(['create', 'join'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 500,
              background: tab === t ? 'var(--card)' : 'transparent',
              color: tab === t ? 'var(--text)' : '#7A7570',
              boxShadow: tab === t ? 'var(--shadow)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t === 'create' ? 'Aanmaken' : 'Deelnemen'}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tab === 'create' ? (
          <>
            <input
              type="text"
              placeholder="Naam van je huishouden"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              style={inputStyle}
            />
            <button onClick={handleCreate} disabled={!naam.trim() || loading} style={btnStyle}>
              {loading ? 'Aanmaken…' : 'Huishouden aanmaken'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Uitnodigingscode (6 tekens)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center' }}
            />
            <button onClick={handleJoin} disabled={code.length !== 6 || loading} style={btnStyle}>
              {loading ? 'Deelnemen…' : 'Deelnemen'}
            </button>
          </>
        )}
        {error && <p style={{ color: 'var(--accent1)', fontSize: 13, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 12,
  border: '1.5px solid rgba(45,42,38,0.12)',
  background: 'var(--card)',
  fontSize: 15,
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
};

const btnStyle: React.CSSProperties = {
  padding: '13px 24px',
  borderRadius: 12,
  background: 'var(--accent1)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  width: '100%',
  opacity: 1,
};
