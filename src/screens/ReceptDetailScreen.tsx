import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Heart, CalendarPlus, PencilSimple, Trash,
  Minus, Plus, CornersOut, CaretRight, Basket, ListNumbers, X,
} from '@phosphor-icons/react';
import { Recept } from '../types';
import { useRecepten } from '../context/ReceptenContext';
import { useWindowWidth, TABLET } from '../hooks/useWindowWidth';
import { IngredientsDivider } from '../components/illustrations/Decorations';
import DinerIllustration from '../components/DinerIllustration';

interface Props {
  recept: Recept;
  onBack: () => void;
  onEdit: (recept: Recept) => void;
  kookModusInitieel?: boolean;
}

export default function ReceptDetailScreen({ recept, onBack, onEdit, kookModusInitieel }: Props) {
  const { updateRecept, deleteRecept, addToWeekkeuze, weekkeuze } = useRecepten();
  const [porties, setPorties] = useState(recept.porties);
  const [kookModus, setKookModus] = useState(kookModusInitieel ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toegevoegd, setToegevoegd] = useState(false);
  const [afgevinktIngredienten, setAfgevinktIngredienten] = useState<Set<number>>(new Set());
  const [actieveStap, setActieveStap] = useState<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const breedte = useWindowWidth();
  const isTablet = breedte >= TABLET;

  const factor = porties / recept.porties;
  const isInWeek = weekkeuze.some((w) => w.receptId === recept.id);

  useEffect(() => {
    if (kookModus && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((wl) => {
        wakeLockRef.current = wl;
      }).catch(() => {});
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    return () => { wakeLockRef.current?.release(); };
  }, [kookModus]);

  const toggleFavoriet = () => updateRecept(recept.id, { favoriet: !recept.favoriet });

  const handleAddToWeek = async () => {
    await addToWeekkeuze(recept.id, porties);
    setToegevoegd(true);
    // TODO: cleanup timer bij unmount om state-update op unmounted component te voorkomen
    setTimeout(() => setToegevoegd(false), 2000);
  };

  const handleDelete = async () => {
    await deleteRecept(recept.id);
    onBack();
  };

  const formatHoeveelheid = (h: number) => {
    const scaled = h * factor;
    if (scaled % 1 === 0) return scaled.toString();
    return scaled.toFixed(1).replace('.0', '');
  };

  const toggleIngredient = (i: number) => {
    setAfgevinktIngredienten((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  // ── Kookmodus — licht kookboek-design ───────────────────────
  if (kookModus) {
    const isWide = isTablet;
    const padH = isWide ? 40 : 20;
    const padV = isWide ? 28 : 20;

    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#FAF7F0', /* TODO: zet als CSS variabele --kookmodus-bg */
        color: 'var(--ink)',
        zIndex: 100,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Subtiele illustratie achtergrond */}
        <DinerIllustration
          section="full"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            opacity: 0.03,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Header */}
        <div style={{
          position: 'relative', zIndex: 1, flexShrink: 0,
          padding: `calc(env(safe-area-inset-top, ${padV}px) + 8px) ${padH}px 16px`,
          display: 'flex', alignItems: 'flex-start', gap: 16,
          borderBottom: '1px solid rgba(26,26,46,0.08)',
          background: 'rgba(250,247,240,0.96)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--font-title)',
              fontSize: isWide ? 28 : 22,
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.2,
              marginBottom: 6,
            }}>
              {recept.titel}
            </h1>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>{porties} {porties === 1 ? 'portie' : 'porties'}</span>
              {recept.bereidingstijd > 0 && (
                <span>{recept.bereidingstijd} min</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setKookModus(false)}
            aria-label="Kookmodus sluiten"
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(22,45,110,0.08)', color: 'var(--cobalt)',
            }}
          >
            <X size={22} weight="bold" />
          </button>
        </div>

        {/* Content — 2 kolommen op tablet/desktop */}
        <div style={{
          position: 'relative', zIndex: 1,
          flex: 1, overflow: 'hidden', minHeight: 0,
          display: 'flex',
          flexDirection: isWide ? 'row' : 'column',
          maxWidth: isWide ? 900 : undefined,
          margin: isWide ? '0 auto' : undefined,
          width: '100%',
        }}>
          {/* ── Ingrediënten ── */}
          {recept.ingredienten.length > 0 && (
            <div style={{
              width: isWide ? 300 : '100%',
              flexShrink: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isWide ? '24px 24px 48px 32px' : '16px 20px 8px',
              borderRight: isWide ? '1px solid rgba(26,26,46,0.08)' : 'none',
              borderBottom: !isWide ? '1px solid rgba(26,26,46,0.08)' : 'none',
              maxHeight: !isWide ? '42vh' : undefined,
            }}>
              <KookSectieHeader icon={<Basket size={12} />} titel="Ingrediënten" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recept.ingredienten.map((ing, i) => {
                  const isAf = afgevinktIngredienten.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleIngredient(i)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 10px', borderRadius: 8, width: '100%', textAlign: 'left',
                        background: isAf ? 'transparent' : 'rgba(22,45,110,0.03)',
                        opacity: isAf ? 0.35 : 1,
                        transition: 'opacity 0.18s, background 0.15s',
                        gap: 10,
                        touchAction: 'pan-y', userSelect: 'none',
                      }}
                    >
                      <span style={{
                        fontSize: isWide ? 15 : 14, color: 'var(--ink)',
                        textDecoration: isAf ? 'line-through' : 'none',
                        flex: 1,
                      }}>
                        {ing.naam}
                      </span>
                      {ing.hoeveelheid > 0 && (
                        <span style={{
                          fontSize: isWide ? 14 : 13, fontWeight: 600,
                          color: 'var(--cobalt)', flexShrink: 0,
                          textDecoration: isAf ? 'line-through' : 'none',
                        }}>
                          {formatHoeveelheid(ing.hoeveelheid)} {ing.eenheid}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Bereiding ── */}
          <div style={{
            flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
            padding: isWide ? '24px 32px 48px 24px' : '16px 20px 56px',
          }}>
            <KookSectieHeader icon={<ListNumbers size={12} />} titel="Bereiding" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: isWide ? 16 : 12 }}>
              {recept.bereiding.map((stap, i) => {
                const isActief = actieveStap === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActieveStap(isActief ? null : i)}
                    style={{
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      padding: '12px 10px', borderRadius: 10, width: '100%', textAlign: 'left',
                      background: isActief ? 'rgba(22,45,110,0.06)' : 'transparent',
                      transition: 'background 0.15s',
                      touchAction: 'pan-y', userSelect: 'none',
                    }}
                  >
                    <div style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: 8, marginTop: 2,
                      background: isActief ? 'var(--cobalt)' : 'rgba(22,45,110,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      color: isActief ? '#fff' : 'var(--cobalt)',
                      transition: 'background 0.15s, color 0.15s',
                    }}>
                      {i + 1}
                    </div>
                    <p style={{
                      fontSize: isWide ? 17 : 16, lineHeight: 1.65,
                      color: 'var(--ink)', flex: 1,
                    }}>
                      {stap}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normaal scherm ──────────────────────────────────────────
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--card)', padding: 'calc(env(safe-area-inset-top, 20px) + 8px) 20px 20px', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
        {/* Subtiele illustratie achtergrond */}
        <DinerIllustration
          section="olive"
          style={{
            position: 'absolute', top: 0, right: 0,
            width: 180, height: '100%',
            opacity: 0.04,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} aria-label="Terug" style={{ color: 'var(--text)', display: 'flex' }}>
            <ArrowLeft size={22} />
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={toggleFavoriet} aria-label={recept.favoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'} style={{ display: 'flex', color: recept.favoriet ? 'var(--amber)' : '#C0BAB3' }}>
            <Heart size={22} weight={recept.favoriet ? 'fill' : 'regular'} />
          </button>
          <button onClick={() => onEdit(recept)} aria-label="Bewerk recept" style={{ display: 'flex', color: 'var(--text-secondary)' }}>
            <PencilSimple size={20} />
          </button>
          <button onClick={() => setConfirmDelete(true)} aria-label="Verwijder recept" style={{ display: 'flex', color: 'var(--crimson)' }}>
            <Trash size={20} />
          </button>
        </div>

        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: isTablet ? 34 : 26, marginBottom: 8 }}>
          {recept.titel}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {recept.keuken && <Chip label={recept.keuken} />}
          {recept.bereidingstijd > 0 && <Chip label={`${recept.bereidingstijd} min`} />}
          <Chip label={recept.moeilijkheid} />
          {recept.tags.map((t) => <Chip key={t} label={t} />)}
        </div>

        {/* Portie aanpasser */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Porties:</span>
          <button
            onClick={() => setPorties(Math.max(1, porties - 1))}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(22,45,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cobalt)' }}
          >
            <Minus size={14} weight="bold" />
          </button>
          <span style={{ fontWeight: 700, fontSize: 17, minWidth: 24, textAlign: 'center', color: 'var(--cobalt)' }}>{porties}</span>
          <button
            onClick={() => setPorties(porties + 1)}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(22,45,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cobalt)' }}
          >
            <Plus size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Acties */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: 8 }}>
        <button
          onClick={handleAddToWeek}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 12,
            background: isInWeek || toegevoegd ? 'var(--olive)' : 'var(--cobalt)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.2s',
          }}
        >
          <CalendarPlus size={16} weight="duotone" />
          {toegevoegd ? 'Toegevoegd!' : isInWeek ? 'Nog een keer' : 'Weekkeuze'}
        </button>
        <button
          onClick={() => setKookModus(true)}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 12,
            background: 'var(--card)', color: 'var(--text)',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: 'var(--shadow)',
          }}
        >
          <CornersOut size={16} weight="duotone" />
          Kookmodus
        </button>
      </div>

      {/* Content: 2-koloms op tablet */}
      <div style={{
        padding: '8px 20px 40px',
        display: isTablet ? 'grid' : 'flex',
        gridTemplateColumns: isTablet ? '1fr 1fr' : undefined,
        flexDirection: isTablet ? undefined : 'column',
        gap: isTablet ? 32 : 24,
        alignItems: 'start',
      }}>
        {/* Ingrediënten */}
        {recept.ingredienten.length > 0 && (
          <section>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: isTablet ? 22 : 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Basket size={20} weight="duotone" color="var(--cobalt)" />
              Ingrediënten
            </h2>
            <div style={{ background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              {recept.ingredienten.map((ing, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderBottom: i < recept.ingredienten.length - 1 ? '1px solid rgba(26,26,46,0.06)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 14, color: 'var(--text)', flex: 1 }}>{ing.naam}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cobalt)', flexShrink: 0 }}>
                    {ing.hoeveelheid > 0 ? `${formatHoeveelheid(ing.hoeveelheid)} ${ing.eenheid}` : ing.eenheid}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        {recept.ingredienten.length > 0 && recept.bereiding.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
            <IngredientsDivider width={Math.min(isTablet ? 560 : 320, 560)} />
          </div>
        )}

        {/* Bereiding */}
        {recept.bereiding.length > 0 && (
          <section>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: isTablet ? 22 : 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListNumbers size={20} weight="duotone" color="var(--cobalt)" />
              Bereiding
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recept.bereiding.map((stap, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                    background: 'var(--cobalt)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 2,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', flex: 1 }}>{stap}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notities + bronlink (in een kolom zetten op tablet als beide boven al 2 cols) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, gridColumn: isTablet ? '1 / -1' : undefined }}>
          {recept.notities && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: isTablet ? 22 : 20, marginBottom: 12 }}>
                Notities
              </h2>
              <div style={{
                background: 'var(--card)', borderRadius: 14, padding: '14px',
                boxShadow: 'var(--shadow)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)',
              }}>
                {recept.notities}
              </div>
            </section>
          )}
          {recept.bronUrl && (
            <a
              href={recept.bronUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 14px', background: 'var(--card)', borderRadius: 12,
                boxShadow: 'var(--shadow)', color: 'var(--cobalt)', fontSize: 13, fontWeight: 500,
              }}
            >
              <span style={{ flex: 1 }}>Bekijk origineel recept</span>
              <CaretRight size={16} weight="bold" />
            </a>
          )}
        </div>
      </div>

      {/* Verwijder bevestiging */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 50,
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '20px 20px 0 0',
            padding: '24px 20px 40px', width: '100%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 20, marginBottom: 8 }}>
              Recept verwijderen?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Dit kan niet ongedaan worden gemaakt.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleDelete}
                style={{ padding: '13px', borderRadius: 12, background: 'var(--crimson)', color: '#fff', fontSize: 15, fontWeight: 600 }}
              >
                Verwijderen
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '13px', borderRadius: 12, background: 'rgba(26,26,46,0.06)', color: 'var(--text)', fontSize: 15 }}
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

function KookSectieHeader({ icon, titel }: { icon: React.ReactNode; titel: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      marginBottom: 14, color: 'var(--cobalt)',
    }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
        {titel}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(22,45,110,0.12)', marginLeft: 4 }} />
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 8,
      background: 'rgba(26,26,46,0.06)',
      fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize',
    }}>
      {label}
    </span>
  );
}
