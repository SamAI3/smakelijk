import { useState, useMemo } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, X, Check } from 'lucide-react';
import { useRecepten } from '../context/ReceptenContext';
import { Ingredient } from '../types';
import { OlijftakDecoratie } from '../components/Illustrations';

interface GecombineerdIngredient {
  naam: string;
  hoeveelheid: number;
  eenheid: string;
  afgevinkt: boolean;
}

export default function WeekkeuzeTab() {
  const { weekkeuze, recepten, updateWeekkeuze, removeFromWeekkeuze, clearWeekkeuze } = useRecepten();
  const [boodschappenModus, setBoodschappenModus] = useState(false);
  const [afgevinkt, setAfgevinkt] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);

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
          map.set(key, { naam: ing.naam, hoeveelheid, eenheid: ing.eenheid, afgevinkt: false });
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

  if (boodschappenModus) {
    return (
      <div className="page-enter" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        <div style={{
          background: 'var(--cobalt)', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow)',
          position: 'sticky', top: 0,
        }}>
          <button onClick={() => setBoodschappenModus(false)} style={{ color: '#fff', display: 'flex' }}>
            <X size={22} />
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
                    background: 'var(--card)',
                    borderRadius: 10,
                    textAlign: 'left',
                    opacity: isAfgevinkt ? 0.45 : 1,
                    transition: 'opacity 0.15s',
                    borderBottom: '1px solid rgba(26,26,46,0.05)',
                    borderLeft: '3px solid var(--cobalt)',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: isAfgevinkt ? 'none' : '2px solid rgba(26,26,46,0.20)',
                    background: isAfgevinkt ? 'var(--olive)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isAfgevinkt && <Check size={13} color="#fff" strokeWidth={3} />}
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

          <button
            onClick={exporteerBoodschappen}
            style={{
              marginTop: 24, width: '100%', padding: '13px',
              borderRadius: 12, background: 'var(--olive)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(74,124,89,0.30)',
            }}
          >
            <ShoppingCart size={18} />
            Exporteer naar Boodschappen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 40, fontWeight: 700, flex: 1, lineHeight: 1.05, color: 'var(--ink)' }}>
          Weekkeuze
        </h1>
        {weekRecepten.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
          >
            <Trash2 size={15} /> Wis alles
          </button>
        )}
      </div>

      <div style={{ padding: '8px 20px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weekRecepten.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text-muted)' }}>
            <div className="float-illustration" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, opacity: 0.55 }}>
              <OlijftakDecoratie size={80} color="var(--olive)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Nog geen recepten gepland.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Voeg recepten toe via de Recepten-tab.
            </p>
          </div>
        )}

        {weekRecepten.map(({ weekItem, recept }) => (
          <div
            key={weekItem.id}
            style={{
              background: 'var(--card)', borderRadius: 12,
              padding: '14px', boxShadow: 'var(--shadow)',
              borderLeft: '3px solid var(--cobalt)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 5, color: 'var(--ink)' }}>
                  {recept!.titel}
                </div>
                <WkMoeilijkheidBadge moeilijkheid={recept!.moeilijkheid} />
              </div>
              <button
                onClick={() => removeFromWeekkeuze(weekItem.id)}
                style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Porties:</span>
              <button
                onClick={() => updateWeekkeuze(weekItem.id, Math.max(1, weekItem.porties - 1))}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(26,26,46,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Minus size={13} />
              </button>
              <span style={{ fontWeight: 700, fontSize: 16, minWidth: 20, textAlign: 'center', color: 'var(--cobalt)' }}>
                {weekItem.porties}
              </span>
              <button
                onClick={() => updateWeekkeuze(weekItem.id, weekItem.porties + 1)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(26,26,46,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        ))}

        {weekRecepten.length > 0 && (
          <button
            onClick={() => setBoodschappenModus(true)}
            style={{
              marginTop: 8, padding: '13px',
              borderRadius: 12, background: 'var(--cobalt)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(27,63,160,0.28)',
            }}
          >
            <ShoppingCart size={18} />
            Naar boodschappenlijst
          </button>
        )}
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
                  boxShadow: '0 2px 10px rgba(184,49,47,0.28)',
                }}
              >
                Wis alles
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                style={{
                  padding: '13px', borderRadius: 12,
                  background: 'rgba(26,26,46,0.06)',
                  color: 'var(--text)', fontSize: 15,
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
      background: isDdw ? 'rgba(74,124,89,0.14)' : 'rgba(184,49,47,0.12)',
      color: isDdw ? 'var(--olive)' : 'var(--crimson)',
    }}>
      {isDdw ? 'Doordeweeks' : 'Weekend'}
    </span>
  );
}
