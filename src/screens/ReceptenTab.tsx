import { useState, useMemo } from 'react';
import { Search, Plus, Star, Clock, ChefHat } from 'lucide-react';
import { useRecepten } from '../context/ReceptenContext';
import { Recept, ReceptType } from '../types';
import { useWindowWidth, TABLET } from '../hooks/useWindowWidth';

const ACCENT_COLORS = [
  'var(--accent1)', 'var(--accent2)', 'var(--accent3)',
  'var(--accent4)', 'var(--accent5)',
];

interface ReceptenTabProps {
  onOpenRecept: (recept: Recept) => void;
  onAddRecept: () => void;
}

export default function ReceptenTab({ onOpenRecept, onAddRecept }: ReceptenTabProps) {
  const { recepten } = useRecepten();
  const [typeFilter, setTypeFilter] = useState<ReceptType>('hoofdgerecht');
  const [zoekterm, setZoekterm] = useState('');
  const [geselecteerdeKeuken, setGeselecteerdeKeuken] = useState<string | null>(null);
  const breedte = useWindowWidth();
  const isTablet = breedte >= TABLET;

  const gefilterd = useMemo(() => {
    return recepten.filter((r) => {
      if (r.type !== typeFilter) return false;
      if (geselecteerdeKeuken && r.keuken !== geselecteerdeKeuken) return false;
      if (zoekterm) {
        const z = zoekterm.toLowerCase();
        return r.titel.toLowerCase().includes(z) ||
          r.keuken.toLowerCase().includes(z) ||
          r.tags.some((t) => t.toLowerCase().includes(z));
      }
      return true;
    });
  }, [recepten, typeFilter, zoekterm, geselecteerdeKeuken]);

  const favorieten = gefilterd.filter((r) => r.favoriet);
  const keukens = useMemo(() => {
    const set = new Set(recepten.filter((r) => r.type === typeFilter && r.keuken).map((r) => r.keuken));
    return Array.from(set);
  }, [recepten, typeFilter]);

  const recent = useMemo(() => {
    return [...gefilterd]
      .sort((a, b) => b.aangemaakt.getTime() - a.aangemaakt.getTime())
      .slice(0, 6);
  }, [gefilterd]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: isTablet ? '28px 32px 12px' : '20px 20px 8px', flexShrink: 0 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: isTablet ? 40 : 32, marginBottom: 16 }}>
          Recepten
        </h1>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(45,42,38,0.06)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 12,
        }}>
          {(['hoofdgerecht', 'overig'] as ReceptType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setGeselecteerdeKeuken(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 500,
                background: typeFilter === t ? 'var(--card)' : 'transparent',
                color: typeFilter === t ? 'var(--text)' : '#7A7570',
                boxShadow: typeFilter === t ? 'var(--shadow)' : 'none',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {t === 'hoofdgerecht' ? 'Hoofdgerechten' : 'Overig'}
            </button>
          ))}
        </div>

        {/* Zoekbalk */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: '#A09A93', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Zoek recepten…"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: 12,
              border: '1.5px solid rgba(45,42,38,0.10)',
              background: 'var(--card)',
              fontSize: 14,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ padding: isTablet ? '0 32px 100px' : '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Favorieten */}
        {favorieten.length > 0 && (
          <section>
            <SectionTitle icon={<Star size={15} />} title="Favorieten" />
            <div style={{
              display: isTablet ? 'grid' : 'flex',
              gridTemplateColumns: isTablet ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
              flexDirection: isTablet ? undefined : 'column',
              gap: 8,
            }}>
              {favorieten.map((r) => (
                <ReceptRij key={r.id} recept={r} onClick={() => onOpenRecept(r)} />
              ))}
            </div>
          </section>
        )}

        {/* Keukentegels */}
        {keukens.length > 0 && (
          <section>
            <SectionTitle icon={<ChefHat size={15} />} title="Keuken" />
            <div style={{
              display: 'flex', gap: 10,
              overflowX: 'auto', paddingBottom: 4,
              marginLeft: isTablet ? -32 : -20, marginRight: isTablet ? -32 : -20,
              paddingLeft: isTablet ? 32 : 20, paddingRight: isTablet ? 32 : 20,
              scrollbarWidth: 'none',
            }}>
              {keukens.map((k, i) => (
                <button
                  key={k}
                  onClick={() => setGeselecteerdeKeuken(geselecteerdeKeuken === k ? null : k)}
                  style={{
                    flexShrink: 0,
                    padding: isTablet ? '12px 20px' : '10px 16px',
                    borderRadius: 12,
                    background: geselecteerdeKeuken === k
                      ? ACCENT_COLORS[i % ACCENT_COLORS.length]
                      : `${ACCENT_COLORS[i % ACCENT_COLORS.length]}22`,
                    color: geselecteerdeKeuken === k ? '#fff' : 'var(--text)',
                    fontSize: isTablet ? 14 : 13,
                    fontWeight: 500,
                    border: `2px solid ${geselecteerdeKeuken === k ? ACCENT_COLORS[i % ACCENT_COLORS.length] : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent toegevoegd */}
        {recent.length > 0 && (
          <section>
            <SectionTitle icon={<Clock size={15} />} title={geselecteerdeKeuken ?? 'Recent toegevoegd'} />
            <div style={{
              display: isTablet ? 'grid' : 'flex',
              gridTemplateColumns: isTablet ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
              flexDirection: isTablet ? undefined : 'column',
              gap: 8,
            }}>
              {recent.map((r) => (
                <ReceptRij key={r.id} recept={r} onClick={() => onOpenRecept(r)} />
              ))}
            </div>
          </section>
        )}

        {gefilterd.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#A09A93' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
            <p style={{ fontSize: 15 }}>Nog geen recepten. Voeg er een toe!</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onAddRecept}
        style={{
          position: 'fixed',
          bottom: 'calc(var(--tab-height) + 16px)',
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 18,
          background: 'var(--accent1)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(196,101,58,0.4)',
          fontSize: 28,
          fontWeight: 300,
          zIndex: 10,
          transition: 'transform 0.15s',
        }}
      >
        <Plus size={26} />
      </button>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#7A7570' }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </span>
    </div>
  );
}

function ReceptRij({ recept, onClick }: { recept: Recept; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--card)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: 'var(--shadow)',
        width: '100%',
        textAlign: 'left',
        transition: 'transform 0.1s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: 'var(--text)' }}>
          {recept.titel}
        </div>
        <div style={{ fontSize: 12, color: '#A09A93', display: 'flex', gap: 8 }}>
          {recept.keuken && <span>{recept.keuken}</span>}
          {recept.bereidingstijd > 0 && <span>· {recept.bereidingstijd} min</span>}
          <span>· {recept.porties} pers.</span>
        </div>
      </div>
      {recept.favoriet && (
        <Star size={14} fill="var(--accent3)" color="var(--accent3)" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}
