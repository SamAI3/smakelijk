import { useState, useMemo } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, X, Check } from 'lucide-react';
import { useRecepten } from '../context/ReceptenContext';
import { Ingredient } from '../types';

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

  // Samenvoeg-logica
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
          map.set(key, {
            naam: ing.naam,
            hoeveelheid,
            eenheid: ing.eenheid,
            afgevinkt: false,
          });
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
      .filter((i) => {
        const key = `${i.naam.toLowerCase().trim()}::${i.eenheid}`;
        return !afgevinkt.has(key);
      })
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
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        <div style={{
          background: 'var(--card)', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow)', position: 'sticky', top: 0,
        }}>
          <button onClick={() => setBoodschappenModus(false)} style={{ color: 'var(--text)', display: 'flex' }}>
            <X size={22} />
          </button>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 22, flex: 1 }}>
            Boodschappenlijst
          </h2>
        </div>

        <div style={{ padding: '16px 20px 32px' }}>
          <p style={{ fontSize: 13, color: '#7A7570', marginBottom: 16 }}>
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
                    opacity: isAfgevinkt ? 0.4 : 1,
                    transition: 'opacity 0.15s',
                    borderBottom: '1px solid rgba(45,42,38,0.05)',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: isAfgevinkt ? 'none' : '2px solid rgba(45,42,38,0.20)',
                    background: isAfgevinkt ? 'var(--accent2)' : 'transparent',
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
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent1)' }}>
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
              borderRadius: 12, background: 'var(--accent2)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 32, flex: 1 }}>
          Weekkeuze
        </h1>
        {weekRecepten.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            style={{ color: '#A09A93', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
          >
            <Trash2 size={15} /> Wis alles
          </button>
        )}
      </div>

      <div style={{ padding: '8px 20px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weekRecepten.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#A09A93' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 15 }}>Nog geen recepten gepland.</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Voeg recepten toe via de recepten-tab.</p>
          </div>
        )}

        {weekRecepten.map(({ weekItem, recept }) => (
          <div
            key={weekItem.id}
            style={{
              background: 'var(--card)', borderRadius: 14,
              padding: '14px', boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>{recept!.titel}</span>
              <button
                onClick={() => removeFromWeekkeuze(weekItem.id)}
                style={{ color: '#C0BAB3', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#7A7570' }}>Porties:</span>
              <button
                onClick={() => updateWeekkeuze(weekItem.id, Math.max(1, weekItem.porties - 1))}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(45,42,38,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Minus size={13} />
              </button>
              <span style={{ fontWeight: 700, fontSize: 16, minWidth: 20, textAlign: 'center' }}>
                {weekItem.porties}
              </span>
              <button
                onClick={() => updateWeekkeuze(weekItem.id, weekItem.porties + 1)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(45,42,38,0.06)',
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
              borderRadius: 12, background: 'var(--accent5)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 50,
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '20px 20px 0 0',
            padding: '24px 20px 40px', width: '100%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 20, marginBottom: 8 }}>
              Weekkeuze wissen?
            </h3>
            <p style={{ color: '#7A7570', fontSize: 14, marginBottom: 20 }}>
              Alle {weekRecepten.length} recepten worden verwijderd uit de weekplanning.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleClearAll}
                style={{
                  padding: '13px', borderRadius: 12, background: 'var(--accent1)',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                }}
              >
                Wis alles
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                style={{
                  padding: '13px', borderRadius: 12,
                  background: 'rgba(45,42,38,0.06)',
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
