import { useState, useMemo } from 'react';
import { Search, Plus, Star, Clock, ChefHat } from 'lucide-react';
import { useRecepten } from '../context/ReceptenContext';
import { Recept, ReceptType, Moeilijkheid } from '../types';
import { useWindowWidth, TABLET } from '../hooks/useWindowWidth';
import { OlijftakDecoratie, BestekDecoratie } from '../components/Illustrations';

type MoeilijkheidFilter = 'alles' | Moeilijkheid;

const ACCENT_COLORS = [
  'var(--cobalt)', 'var(--crimson)', 'var(--olive)', 'var(--amber)', 'var(--accent4)',
];
const ACCENT_BG = [
  'rgba(27,63,160,0.10)', 'rgba(184,49,47,0.10)', 'rgba(74,124,89,0.10)',
  'rgba(232,168,56,0.14)', 'rgba(212,118,78,0.12)',
];

interface ReceptenTabProps {
  onOpenRecept: (recept: Recept) => void;
  onAddRecept: () => void;
}

export default function ReceptenTab({ onOpenRecept, onAddRecept }: ReceptenTabProps) {
  const { recepten } = useRecepten();
  const [typeFilter, setTypeFilter] = useState<ReceptType>('hoofdgerecht');
  const [moeilijkheidFilter, setMoeilijkheidFilter] = useState<MoeilijkheidFilter>('alles');
  const [zoekterm, setZoekterm] = useState('');
  const [geselecteerdeKeuken, setGeselecteerdeKeuken] = useState<string | null>(null);
  const breedte = useWindowWidth();
  const isTablet = breedte >= TABLET;

  const gefilterdBase = useMemo(() => {
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

  const gefilterd = useMemo(() => {
    if (moeilijkheidFilter === 'alles') return gefilterdBase;
    return gefilterdBase.filter((r) => r.moeilijkheid === moeilijkheidFilter);
  }, [gefilterdBase, moeilijkheidFilter]);

  const telPerMoeilijkheid = useMemo(() => ({
    alles: gefilterdBase.length,
    doordeweeks: gefilterdBase.filter((r) => r.moeilijkheid === 'doordeweeks').length,
    weekend: gefilterdBase.filter((r) => r.moeilijkheid === 'weekend').length,
  }), [gefilterdBase]);

  const favorieten = gefilterd.filter((r) => r.favoriet);
  const keukens = useMemo(() => {
    const set = new Set(recepten.filter((r) => r.type === typeFilter && r.keuken).map((r) => r.keuken));
    return Array.from(set);
  }, [recepten, typeFilter]);

  const lijstRecepten = useMemo(() => {
    return [...gefilterd].sort((a, b) => b.aangemaakt.getTime() - a.aangemaakt.getTime());
  }, [gefilterd]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: isTablet ? '28px 32px 12px' : '20px 20px 10px', flexShrink: 0 }}>
        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontSize: isTablet ? 48 : 40,
          fontWeight: 700,
          marginBottom: 16,
          lineHeight: 1.05,
          color: 'var(--ink)',
        }}>
          Recepten
        </h1>

        {/* Toggle Hoofdgerechten / Overig */}
        <div style={{
          display: 'flex',
          background: 'rgba(26,26,46,0.06)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 10,
        }}>
          {(['hoofdgerecht', 'overig'] as ReceptType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setGeselecteerdeKeuken(null); setMoeilijkheidFilter('alles'); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 600,
                background: typeFilter === t ? 'var(--cobalt)' : 'transparent',
                color: typeFilter === t ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: typeFilter === t ? '0 2px 8px rgba(27,63,160,0.25)' : 'none',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {t === 'hoofdgerecht' ? 'Hoofdgerechten' : 'Overig'}
            </button>
          ))}
        </div>

        {/* Doordeweeks / Weekend / Alles chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {([
            {
              key: 'alles' as const,
              label: 'Alles',
              count: telPerMoeilijkheid.alles,
              activeBg: 'var(--ink)',
              activeTekst: '#FFFDF7',
              inactiveBg: 'rgba(26,26,46,0.07)',
              inactiveTekst: 'var(--text-secondary)',
            },
            {
              key: 'doordeweeks' as const,
              label: 'Doordeweeks',
              count: telPerMoeilijkheid.doordeweeks,
              activeBg: 'var(--olive)',
              activeTekst: '#ffffff',
              inactiveBg: 'rgba(74,124,89,0.10)',
              inactiveTekst: 'var(--olive)',
            },
            {
              key: 'weekend' as const,
              label: 'Weekend',
              count: telPerMoeilijkheid.weekend,
              activeBg: 'var(--crimson)',
              activeTekst: '#ffffff',
              inactiveBg: 'rgba(184,49,47,0.10)',
              inactiveTekst: 'var(--crimson)',
            },
          ]).map(({ key, label, count, activeBg, activeTekst, inactiveBg, inactiveTekst }) => {
            const isActief = moeilijkheidFilter === key;
            return (
              <button
                key={key}
                onClick={() => setMoeilijkheidFilter(key)}
                style={{
                  flex: 1,
                  padding: '9px 6px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  background: isActief ? activeBg : inactiveBg,
                  color: isActief ? activeTekst : inactiveTekst,
                  transition: 'all 0.15s',
                  lineHeight: 1.2,
                }}
              >
                <div>{label}</div>
                <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, marginTop: 1 }}>{count}</div>
              </button>
            );
          })}
        </div>

        {/* Zoekbalk */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
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
              border: '1.5px solid var(--border-color)',
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
            <SectionTitle icon={<Star size={13} />} title="Favorieten" />
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
            <SectionTitle icon={<ChefHat size={13} />} title="Keuken" />
            <div style={{
              display: 'flex', gap: 8,
              overflowX: 'auto', paddingBottom: 4,
              marginLeft: isTablet ? -32 : -20, marginRight: isTablet ? -32 : -20,
              paddingLeft: isTablet ? 32 : 20, paddingRight: isTablet ? 32 : 20,
              scrollbarWidth: 'none',
            }}>
              <button
                onClick={() => setGeselecteerdeKeuken(null)}
                style={{
                  flexShrink: 0,
                  padding: isTablet ? '10px 18px' : '8px 14px',
                  borderRadius: 10,
                  background: geselecteerdeKeuken === null ? 'var(--cobalt)' : 'rgba(26,26,46,0.07)',
                  color: geselecteerdeKeuken === null ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: isTablet ? 14 : 13,
                  fontWeight: 600,
                  border: '2px solid transparent',
                  transition: 'all 0.15s',
                  boxShadow: geselecteerdeKeuken === null ? '0 2px 8px rgba(27,63,160,0.22)' : 'none',
                }}
              >
                Alle keukens
              </button>
              {keukens.map((k, i) => (
                <button
                  key={k}
                  onClick={() => setGeselecteerdeKeuken(k)}
                  style={{
                    flexShrink: 0,
                    padding: isTablet ? '10px 18px' : '8px 14px',
                    borderRadius: 10,
                    background: geselecteerdeKeuken === k
                      ? ACCENT_COLORS[i % ACCENT_COLORS.length]
                      : ACCENT_BG[i % ACCENT_BG.length],
                    color: geselecteerdeKeuken === k ? '#ffffff' : 'var(--text)',
                    fontSize: isTablet ? 14 : 13,
                    fontWeight: 600,
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

        {/* Receptenlijst */}
        {lijstRecepten.length > 0 && (
          <section>
            <SectionTitle
              icon={geselecteerdeKeuken ? <ChefHat size={13} /> : <Clock size={13} />}
              title={geselecteerdeKeuken ?? 'Alle recepten'}
            />
            <div style={{
              display: isTablet ? 'grid' : 'flex',
              gridTemplateColumns: isTablet ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
              flexDirection: isTablet ? undefined : 'column',
              gap: 8,
            }}>
              {lijstRecepten.map((r) => (
                <ReceptRij key={r.id} recept={r} onClick={() => onOpenRecept(r)} />
              ))}
            </div>
          </section>
        )}

        {/* Lege state */}
        {gefilterd.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.5 }}>
              <BestekDecoratie size={40} color="var(--cobalt)" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Nog geen recepten. Voeg er een toe!
            </p>
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
          background: 'var(--crimson)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(184,49,47,0.42)',
          fontSize: 28,
          fontWeight: 300,
          zIndex: 10,
          transition: 'transform 0.15s, background 0.15s',
        }}
      >
        <Plus size={26} />
      </button>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, color: 'var(--cobalt)' }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {title}
      </span>
    </div>
  );
}

function ReceptRij({ recept, onClick }: { recept: Recept; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="recipe-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--card)',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: 'var(--shadow)',
        width: '100%',
        textAlign: 'left',
        borderLeft: '3px solid var(--cobalt)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 5, color: 'var(--ink)' }}>
          {recept.titel}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <MoeilijkheidBadge moeilijkheid={recept.moeilijkheid} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 5 }}>
            {recept.keuken && <span>{recept.keuken}</span>}
            {recept.bereidingstijd > 0 && <span>· {recept.bereidingstijd} min</span>}
            <span>· {recept.porties} pers.</span>
          </div>
        </div>
      </div>
      {recept.favoriet && (
        <Star size={14} fill="var(--accent3)" color="var(--accent3)" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}

function MoeilijkheidBadge({ moeilijkheid }: { moeilijkheid: 'doordeweeks' | 'weekend' }) {
  const isDdw = moeilijkheid === 'doordeweeks';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      background: isDdw ? 'rgba(74,124,89,0.14)' : 'rgba(184,49,47,0.12)',
      color: isDdw ? 'var(--olive)' : 'var(--crimson)',
    }}>
      {isDdw ? 'Doordeweeks' : 'Weekend'}
    </span>
  );
}
