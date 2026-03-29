import { useState, useMemo } from 'react';
import {
  MagnifyingGlass, Plus, Heart, Timer, UsersThree, ChefHat,
} from '@phosphor-icons/react';
import { useRecepten } from '../context/ReceptenContext';
import { Recept, ReceptType, Moeilijkheid } from '../types';
import { useWindowWidth, TABLET } from '../hooks/useWindowWidth';
import { BestekDecoratie } from '../components/Illustrations';
import DinerIllustration from '../components/DinerIllustration';

const KEUKEN_EMOJI: Record<string, string> = {
  'Italiaans': '🇮🇹',
  'Frans': '🇫🇷',
  'Aziatisch': '🌏',
  'Thais': '🇹🇭',
  'Chinees': '🇨🇳',
  'Japans': '🇯🇵',
  'Mexicaans': '🇲🇽',
  'Spaans': '🇪🇸',
  'Nederlands': '🇳🇱',
  'Indiaas': '🇮🇳',
  'Arabisch': '🌙',
  'Grieks': '🇬🇷',
  'Midden-Oosters': '🌙',
};
function getKeukenEmoji(keuken: string): string {
  return KEUKEN_EMOJI[keuken] ?? '🍽️';
}

type MoeilijkheidFilter = 'alles' | Moeilijkheid;

// Subtiele keuken-tint per keuken (max ~7% opacity)
const KEUKEN_TINT: Record<string, string> = {
  'Italiaans': 'rgba(74,124,89,0.07)',
  'Frans': 'rgba(22,45,110,0.06)',
  'Aziatisch': 'rgba(232,168,56,0.08)',
  'Thais': 'rgba(232,168,56,0.08)',
  'Chinees': 'rgba(139,37,41,0.06)',
  'Japans': 'rgba(232,168,56,0.07)',
  'Mexicaans': 'rgba(139,37,41,0.06)',
  'Spaans': 'rgba(139,37,41,0.06)',
  'Nederlands': 'rgba(22,45,110,0.05)',
  'Indiaas': 'rgba(232,168,56,0.09)',
  'Arabisch': 'rgba(212,118,78,0.08)',
  'Grieks': 'rgba(22,45,110,0.07)',
  'Midden-Oosters': 'rgba(212,118,78,0.08)',
};
function getKeukenTint(keuken: string): string {
  return KEUKEN_TINT[keuken] ?? 'rgba(26,26,46,0.04)';
}

const ACCENT_COLORS = [
  'var(--cobalt)', 'var(--crimson)', 'var(--olive)', 'var(--amber)', 'var(--accent4)',
];
const ACCENT_BG = [
  'rgba(22,45,110,0.10)', 'rgba(139,37,41,0.10)', 'rgba(74,124,89,0.10)',
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

  const filterKey = `${typeFilter}|${moeilijkheidFilter}|${geselecteerdeKeuken ?? ''}|${zoekterm}`;

  return (
    <div className="page-enter" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Immersive hero — illustratie met overlappende filters */}
      <div style={{ position: 'relative', marginBottom: 16, flexShrink: 0 }}>
        {/* Full-bleed illustratie */}
        <div style={{
          position: 'relative',
          height: isTablet ? 300 : 260,
          overflow: 'hidden',
          borderRadius: '0 0 20px 20px',
        }}>
          <DinerIllustration
            section="full"
            style={{ width: '100%', height: '100%', objectPosition: 'center 70%' }}
            loading="eager"
          />
          {/* Donkere top-gradient: status bar iconen leesbaar houden (black-translucent) */}
          {/* Lichte onderste gradient: filters leesbaar over de illustratie */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(15,10,5,0.28) 0%, transparent 22%, rgba(245,240,232,0.50) 68%, rgba(245,240,232,0.92) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Filters over de onderkant van de illustratie */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: isTablet ? 32 : 12,
            right: isTablet ? 32 : 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {/* Toggle Hoofdgerechten / Overig */}
            <div style={{
              display: 'flex',
              background: 'rgba(250,247,240,0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 12, padding: 4,
            }}>
              {(['hoofdgerecht', 'overig'] as ReceptType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setGeselecteerdeKeuken(null); setMoeilijkheidFilter('alles'); }}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 9,
                    fontSize: 14, fontWeight: 600,
                    background: typeFilter === t ? 'var(--cobalt)' : 'transparent',
                    color: typeFilter === t ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: typeFilter === t ? '0 2px 8px rgba(22,45,110,0.25)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {t === 'hoofdgerecht' ? 'Hoofdgerechten' : 'Overig'}
                </button>
              ))}
            </div>

            {/* Doordeweeks / Weekend / Alles chips */}
            <div style={{
              display: 'flex', gap: 6,
              background: 'rgba(250,247,240,0.78)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 12, padding: 4,
            }}>
              {([
                { key: 'alles' as const, label: 'Alles', count: telPerMoeilijkheid.alles, activeBg: 'var(--ink)', activeTekst: '#FFFDF7', inactiveTekst: 'var(--text-secondary)' },
                { key: 'doordeweeks' as const, label: 'Doordeweeks', count: telPerMoeilijkheid.doordeweeks, activeBg: 'var(--olive)', activeTekst: '#ffffff', inactiveTekst: 'var(--olive)' },
                { key: 'weekend' as const, label: 'Weekend', count: telPerMoeilijkheid.weekend, activeBg: 'var(--crimson)', activeTekst: '#ffffff', inactiveTekst: 'var(--crimson)' },
              ]).map(({ key, label, count, activeBg, activeTekst, inactiveTekst }) => {
                const isActief = moeilijkheidFilter === key;
                return (
                  <button key={key} onClick={() => setMoeilijkheidFilter(key)} style={{
                    flex: 1, padding: '8px 6px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: isActief ? activeBg : 'transparent',
                    color: isActief ? activeTekst : inactiveTekst,
                    transition: 'all 0.15s', lineHeight: 1.2,
                  }}>
                    <div>{label}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, marginTop: 1 }}>{count}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Zoekbalk */}
      <div style={{ padding: isTablet ? '0 32px 12px' : '0 20px 12px', flexShrink: 0 }}>
        <div className="search-wrapper" style={{ position: 'relative' }}>
          <MagnifyingGlass size={16} weight="regular" style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Zoek recepten…"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12,
              border: '1.5px solid var(--border-color)', background: 'var(--card)',
              fontSize: 14, color: 'var(--text)', outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ padding: isTablet ? '0 32px 100px' : '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Favorieten */}
        {favorieten.length > 0 && (
          <section>
            <SectionTitle icon={<Heart size={13} weight="fill" />} title="Favorieten" />
            <div key={`fav-${filterKey}`} style={{ display: 'flex', flexDirection: 'column' }}>
              {favorieten.map((r, i) => (
                <CompactReceptRij
                  key={r.id} recept={r} onClick={() => onOpenRecept(r)}
                  index={i} isLast={i === favorieten.length - 1}
                />
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
                  flexShrink: 0, padding: '8px 14px', borderRadius: 10,
                  background: geselecteerdeKeuken === null ? 'var(--cobalt)' : 'rgba(26,26,46,0.07)',
                  color: geselecteerdeKeuken === null ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600,
                  border: '2px solid transparent',
                  transition: 'all 0.15s',
                  boxShadow: geselecteerdeKeuken === null ? '0 2px 8px rgba(22,45,110,0.22)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span style={{ fontSize: 15 }}>🍽️</span>
                Alle keukens
              </button>
              {keukens.map((k, i) => (
                <button
                  key={k}
                  onClick={() => setGeselecteerdeKeuken(k)}
                  style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: 10,
                    background: geselecteerdeKeuken === k
                      ? ACCENT_COLORS[i % ACCENT_COLORS.length]
                      : ACCENT_BG[i % ACCENT_BG.length],
                    color: geselecteerdeKeuken === k ? '#ffffff' : 'var(--text)',
                    fontSize: 13, fontWeight: 600,
                    border: `2px solid ${geselecteerdeKeuken === k ? ACCENT_COLORS[i % ACCENT_COLORS.length] : 'transparent'}`,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{getKeukenEmoji(k)}</span>
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
              icon={geselecteerdeKeuken
                ? <span style={{ fontSize: 13 }}>{getKeukenEmoji(geselecteerdeKeuken)}</span>
                : <Timer size={13} />}
              title={geselecteerdeKeuken ?? 'Alle recepten'}
            />
            <div key={`list-${filterKey}`} style={{ display: 'flex', flexDirection: 'column' }}>
              {lijstRecepten.map((r, i) => {
                if (i === 0) {
                  return (
                    <FeaturedReceptCard
                      key={r.id} recept={r} onClick={() => onOpenRecept(r)} index={i}
                    />
                  );
                }
                return (
                  <CompactReceptRij
                    key={r.id} recept={r} onClick={() => onOpenRecept(r)}
                    index={i} isLast={i === lijstRecepten.length - 1}
                  />
                );
              })}
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
        className="fab"
        style={{
          position: 'fixed',
          bottom: 'calc(var(--tab-height) + 16px)',
          right: 20,
          width: 56, height: 56, borderRadius: 18,
          background: 'var(--crimson)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(139,37,41,0.42)',
          zIndex: 10,
        }}
      >
        <Plus size={26} weight="bold" />
      </button>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      marginBottom: 12, color: 'var(--cobalt)',
    }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(22,45,110,0.12)', marginLeft: 4 }} />
    </div>
  );
}

/** Groot featured kaartje — eerste recept in de lijst */
function FeaturedReceptCard({ recept, onClick, index = 0 }: { recept: Recept; onClick: () => void; index?: number }) {
  return (
    <button
      onClick={onClick}
      className="recipe-featured-card"
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'var(--card)',
        borderRadius: 16,
        padding: '20px',
        boxShadow: '0 3px 18px rgba(26,26,46,0.09)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 12,
        animationDelay: `${Math.min(index * 45, 500)}ms`,
      }}
    >
      {/* Subtiele keuken-tint */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        background: getKeukenTint(recept.keuken), pointerEvents: 'none',
      }} />
      {/* Diner illustratie — rechtsonder, subtiel */}
      <DinerIllustration
        section="wine"
        style={{
          position: 'absolute', right: 0, bottom: 0,
          width: 120, height: 120,
          opacity: 0.07,
          mixBlendMode: 'multiply',
          borderRadius: '0 0 16px 0',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <MoeilijkheidBadge moeilijkheid={recept.moeilijkheid} />
          {recept.favoriet && <Heart size={14} weight="fill" color="var(--amber)" />}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: 22,
          color: 'var(--ink)', marginBottom: 10, lineHeight: 1.2,
        }}>
          {recept.titel}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {recept.keuken && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 14 }}>{getKeukenEmoji(recept.keuken)}</span>
              {recept.keuken}
            </span>
          )}
          {recept.bereidingstijd > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <Timer size={13} weight="duotone" /> {recept.bereidingstijd} min
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
            <UsersThree size={13} weight="duotone" /> {recept.porties} pers.
          </span>
        </div>
      </div>
    </button>
  );
}

/** Compact lijstrij — overige recepten */
function CompactReceptRij({
  recept, onClick, index = 0, isLast = false,
}: {
  recept: Recept; onClick: () => void; index?: number; isLast?: boolean;
}) {
  return (
    <>
      <button
        onClick={onClick}
        className="recipe-compact-row"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 4px', width: '100%', textAlign: 'left',
          animationDelay: `${Math.min(index * 35, 500)}ms`,
        }}
      >
        {/* Keuken emoji blokje */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(26,26,46,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {getKeukenEmoji(recept.keuken || '')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: 15,
            color: 'var(--ink)', marginBottom: 3, lineHeight: 1.2,
          }}>
            {recept.titel}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <MoeilijkheidBadge moeilijkheid={recept.moeilijkheid} />
            {recept.bereidingstijd > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Timer size={11} weight="regular" /> {recept.bereidingstijd} min
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <UsersThree size={11} weight="regular" /> {recept.porties}
            </span>
          </div>
        </div>
        {recept.favoriet && <Heart size={15} weight="fill" color="var(--amber)" style={{ flexShrink: 0 }} />}
      </button>
      {!isLast && (
        <div style={{ height: 1, background: 'rgba(26,26,46,0.06)', marginLeft: 50 }} />
      )}
    </>
  );
}

function MoeilijkheidBadge({ moeilijkheid }: { moeilijkheid: 'doordeweeks' | 'weekend' }) {
  const isDdw = moeilijkheid === 'doordeweeks';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700,
      letterSpacing: 0.3, textTransform: 'uppercase',
      background: isDdw ? 'rgba(74,124,89,0.14)' : 'rgba(139,37,41,0.12)',
      color: isDdw ? 'var(--olive)' : 'var(--crimson)',
    }}>
      {isDdw ? 'Doordeweeks' : 'Weekend'}
    </span>
  );
}
