import { useState } from 'react';
import { LogOut, Copy, Check, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';

export default function InstellingenTab() {
  const { user, signOutUser } = useAuth();
  const { household } = useHousehold();
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = async () => {
    if (!household) return;
    await navigator.clipboard.writeText(household.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
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
                src={user.photoURL}
                alt="Avatar"
                style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--accent4)',
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
            <div style={{
              background: 'var(--card)', borderRadius: 14,
              boxShadow: 'var(--shadow)', overflow: 'hidden',
            }}>
              <SettingsRow label="Naam" value={household.naam} />
              <div style={{
                display: 'flex', alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(45,42,38,0.06)',
              }}>
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
                    color: codeCopied ? '#fff' : '#7A7570',
                    transition: 'all 0.2s',
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

        {/* Over */}
        <SettingsSection title="Over">
          <div style={{
            background: 'var(--card)', borderRadius: 14,
            boxShadow: 'var(--shadow)', overflow: 'hidden',
          }}>
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
      <h3 style={{
        fontSize: 12, fontWeight: 600, color: '#A09A93',
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
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
      padding: '12px 14px',
      borderBottom: '1px solid rgba(45,42,38,0.06)',
    }}>
      <span style={{ fontSize: 14, color: '#7A7570' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
