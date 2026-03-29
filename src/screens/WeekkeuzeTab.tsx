import { useState, useMemo } from 'react';
import { Trash, Minus, Plus, ShoppingCart, X, Check, CookingPot, ChefHat } from '@phosphor-icons/react';
import DinerIllustration from '../components/DinerIllustration';
import { useRecepten } from '../context/ReceptenContext';
import { useWindowWidth, TABLET } from '../hooks/useWindowWidth';
import { Ingredient, Recept } from '../types';

const KEUKEN_EMOJI: Record<string, string> = {
  'Italiaans': '🇮🇹', 'Frans': '🇫🇷', 'Aziatisch': '🌏', 'Thais': '🇹🇭',
  'Chinees': '🇨🇳', 'Japans': '🇯🇵', 'Mexicaans': '🇲🇽', 'Spaans': '🇪🇸',
  'Nederlands': '🇳🇱', 'Indiaas': '🇮🇳', 'Arabisch': '🌙', 'Grieks': '🇬🇷',
  'Midden-Oosters': '🌙',
};
function getKeukenEmoji(keuken: string): string {
  return KEUKEN_EMOJI[keuken] ?? '🍽️';
}

const MAANDEN = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

function getWeekBereik(): string {
  const now = new Date();
  const dag = now.getDay(); // 0 = zondag
  const maandag = new Date(now);
  maandag.setDate(now.getDate() - (dag === 0 ? 6 : dag - 1));
  const zondag = new Date(maandag);
  zondag.setDate(maandag.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()} ${MAANDEN[d.getMonth()]}`;
  return `${fmt(maandag)} – ${fmt(zondag)}`;
}

interface GecombineerdIngredient {
  naam: string;
  hoeveelheid: number;
  eenheid: string;
}

interface WeekkeuzeTabProps {
  onGaNaarRecepten?: () => void;
  onStartKoken?: (recept: Recept) => void;
}

export default function WeekkeuzeTab({ onGaNaarRecepten, onStartKoken }: WeekkeuzeTabProps) {
  const { weekkeuze, recepten, updateWeekkeuze, removeFromWeekkeuze, clearWeekkeuze } = useRecepten();
  const [boodschappenModus, setBoodschappenModus] = useState(false);
  const [afgevinkt, setAfgevinkt] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);
  const breedte = useWindowWidth();
  const isTablet = breedte >= TABLET;

  const weekRecepten = useMemo(() => {
    return weekkeuze.map((w) => ({
      weekItem: w,
      recept: recepten.find((r) => r.id === w.receptId),
    })).filter((x) => x.recept != null);
  }, [weekkeuze, recepten]);

  const gecombineerdeIngredienten = useMemo((): GecombineerdIngredient[] => {
    const map = new Map<string, GecombineerdIngredient>();
    for (const { weekItem, recept } of weekRecepten) {
      if (!recept) continue;
      const factor = weekItem.porties / recept.porties;
      for (const ing of recept.ingredienten) {
        if (!ing.naam.trim()) continue;
        const key = `${ing.naam.toLowerCase().trim()}::${ing.eenheid}`;
        const bestaand = map.get(key);
        const hoeveelheid = ing.hoeveelheid * factor;
        if (bestaand) {
          bestaand.hoeveelheid += hoeveelheid;
        } else {
          map.set(key, { naam: ing.naam, hoeveelheid, eenheid: ing.eenheid });
        }
      }
    }
    return Array.from(map.values());
  }, [weekRecepten]);

  const toggleAfgevinkt = (key: string) => {
    setAfgevinkt((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const exporteerBoodschappen = () => {
    const regels = gecombineerdeIngredienten
      .filter((i) => !afgevinkt.has(`${i.naam.toLowerCase().trim()}::${i.eenheid}`))
      .map((i) => {
        const h = i.hoeveelheid % 1 === 0 ? i.hoeveelheid : i.hoeveelheid.toFixed(1);
        return i.hoeveelheid > 0 ? `${h} ${i.eenheid} ${i.naam}` : i.naam;
      })
      .join('\n');
    const encoded = encodeURIComponent(regels);
    window.location.href = `shortcuts://run-shortcut?name=Boodschappen&input=text&text=${encoded}`;
  };

  const handleClearAll = async () => {
    await clearWeekkeuze();
    setConfirmClear(false);
    setBoodschappenModus(false);
    setAfgevinkt(new Set());
  };

  // ── Boodschappenmodus ─────────────────────────────────────
  if (boodschappenModus) {
    return (
      <div className="page-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--bg)' }}>
        <div style={{
          background: 'var(--cobalt)',
          padding: 'calc(env(safe-area-inset-top, 16px) + 8px) 20px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button onClick={() => setBoodschappenModus(false)} style={{ color: '#fff', display: 'flex' }}>
            <X size={22} weight="bold" />
          </button>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 700, flex: 1, color: '#fff' }}>
            Boodschappenlijst
          </h2>
        </div>

        <div style={{ padding: '16px 20px 32px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Vink af wat je al hebt, exporteer de rest.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {gecombineerdeIngredienten.map((ing) => {
              const key = `${ing.naam.toLowerCase().trim()}::${ing.eenheid}`;
              const isAfgevinkt = afgevinkt.has(key);
              const h = ing.hoeveelheid % 1 === 0 ? ing.hoeveelheid : ing.hoeveelheid.toFixed(1);
              return (
                <button
                  key={key}
                  onClick={() => toggleAfgevinkt(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: 'var(--card)', borderRadius: 10, textAlign: 'left',
                    opacity: isAfgevinkt ? 0.45 : 1, transition: 'opacity 0.15s',
                    borderBottom: '1px solid rgba(26,26,46,0.05)',
                    touchAction: 'pan-y', userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: isAfgevinkt ? 'none' : '2px solid rgba(26,26,46,0.20)',
                    background: isAfgevinkt ? 'var(--olive)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isAfgevinkt && <Check size={13} weight="bold" color="#fff" />}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 15,
                    textDecoration: isAfgevinkt ? 'line-through' : 'none',
                  }}>
                    {ing.naam}
                  </span>
                  {ing.hoeveelheid > 0 && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cobalt)' }}>
                      {h} {ing.eenheid}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <button
              onClick={exporteerBoodschappen}
              style={{
                width: '100%', maxWidth: 320, padding: '13px',
                borderRadius: 12, background: 'var(--olive)', color: '#fff',
                fontSize: 15, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(74,124,89,0.32)',
              }}
            >
              <ShoppingCart size={18} />
              Exporteer naar Boodschappen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Lege state ────────────────────────────────────────────
  if (weekRecepten.length === 0) {
    return (
      <div className="page-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--bg)' }}>
        <div style={{
          position: 'relative',
          height: isTablet ? 240 : 200,
          overflow: 'hidden',
          borderRadius: '0 0 20px 20px',
          flexShrink: 0,
        }}>
          <DinerIllustration
            section="full"
            style={{ width: '100%', height: '100%', objectPosition: 'center 70%' }}
            loading="eager"
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(15,10,5,0.28) 0%, transparent 22%, rgba(245,240,232,0.50) 68%, rgba(245,240,232,0.92) 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        <div style={{ padding: '0 20px', marginTop: -50, position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'rgba(250,247,240,0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 16, padding: 24,
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(26,26,46,0.10)',
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Nog geen recepten gepland.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Voeg recepten toe via de Recepten-tab.
            </p>
            {onGaNaarRecepten && (
              <button
                onClick={onGaNaarRecepten}
                style={{
                  padding: '11px 24px', borderRadius: 12,
                  background: 'var(--cobalt)', color: '#fff',
                  fontSize: 14, fontWeight: 600,
                  boxShadow: '0 3px 12px rgba(22,45,110,0.25)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <CookingPot size={16} weight="fill" />
                Ga naar recepten
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Gevulde state ─────────────────────────────────────────
  return (
    <div className="page-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--bg)' }}>

      {/* Hero illustratie */}
      <div style={{
        position: 'relative',
        height: isTablet ? 240 : 200,
        overflow: 'hidden',
        borderRadius: '0 0 20px 20px',
        flexShrink: 0,
      }}>
        <DinerIllustration
          section="full"
          style={{ width: '100%', height: '100%', objectPosition: 'center 70%' }}
          loading="eager"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,10,5,0.28) 0%, transparent 22%, rgba(245,240,232,0.50) 68%, rgba(245,240,232,0.92) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Frosted header card */}
      <div style={{ padding: '0 20px', marginTop: -50, position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(250,247,240,0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 16, padding: '16px 20px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(26,26,46,0.09)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 700,
            color: 'var(--cobalt)', marginBottom: 4,
          }}>
            Wat eten we deze week?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {getWeekBereik()}
          </p>
        </div>
      </div>

      {/* Recept cards */}
      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weekRecepten.map(({ weekItem, recept }) => (
          <div
            key={weekItem.id}
            style={{
              background: 'var(--card)', borderRadius: 16,
              padding: '14px 14px 12px', boxShadow: 'var(--shadow)',
            }}
          >
            {/* Bovenste rij: emoji + titel + verwijder */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'rgba(26,26,46,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {getKeukenEmoji(recept!.keuken || '')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: 15,
                  marginBottom: 5, color: 'var(--ink)', lineHeight: 1.3,
                }}>
                  {recept!.titel}
                </div>
                <WkMoeilijkheidBadge moeilijkheid={recept!.moeilijkheid} />
              </div>
              <button
                onClick={() => removeFromWeekkeuze(weekItem.id)}
                style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0, padding: 2 }}
              >
                <X size={18} weight="regular" />
              </button>
            </div>

            {/* Onderste rij: porties + kookmodus */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Porties:</span>
              <button
                onClick={() => updateWeekkeuze(weekItem.id, Math.max(1, weekItem.porties - 1))}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(22,45,110,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--cobalt)',
                }}
              >
                <Minus size={13} weight="bold" />
              </button>
              <span style={{ fontWeight: 700, fontSize: 16, minWidth: 20, textAlign: 'center', color: 'var(--cobalt)' }}>
                {weekItem.porties}
              </span>
              <button
                onClick={() => updateWeekkeuze(weekItem.id, weekItem.porties + 1)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(22,45,110,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--cobalt)',
                }}
              >
                <Plus size={13} weight="bold" />
              </button>
              <div style={{ flex: 1 }} />
              {onStartKoken && (
                <button
                  onClick={() => onStartKoken(recept!)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 10,
                    background: 'var(--cobalt)', color: '#fff',
                    fontSize: 13, fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(22,45,110,0.22)',
                  }}
                >
                  <ChefHat size={15} weight="fill" />
                  Koken
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Acties onderaan */}
      <div style={{
        padding: '16px 20px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={() => setBoodschappenModus(true)}
          style={{
            width: '100%', maxWidth: 320, padding: '13px',
            borderRadius: 12, background: 'var(--cobalt)', color: '#fff',
            fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(22,45,110,0.28)',
          }}
        >
          <ShoppingCart size={18} />
          Naar boodschappenlijst
        </button>

        {/* Destructieve actie — bewust onderaan en subtiel */}
        <button
          onClick={() => setConfirmClear(true)}
          style={{
            fontSize: 13, color: 'var(--crimson)',
            display: 'flex', alignItems: 'center', gap: 5,
            opacity: 0.8,
          }}
        >
          <Trash size={13} />
          Weekkeuze wissen
        </button>
      </div>

      {/* Bevestiging wis alles */}
      {confirmClear && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.45)',
          display: 'flex', alignItems: 'flex-end', zIndex: 50,
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '20px 20px 0 0',
            padding: '24px 20px 40px', width: '100%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>
              Weekkeuze wissen?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Alle {weekRecepten.length} recepten worden verwijderd uit de weekplanning.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleClearAll}
                style={{
                  padding: '13px', borderRadius: 12, background: 'var(--crimson)',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  boxShadow: '0 2px 10px rgba(139,37,41,0.28)',
                }}
              >
                Wis alles
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                style={{
                  padding: '13px', borderRadius: 12,
                  background: 'rgba(26,26,46,0.06)', color: 'var(--text)', fontSize: 15,
                }}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WkMoeilijkheidBadge({ moeilijkheid }: { moeilijkheid: 'doordeweeks' | 'weekend' }) {
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
