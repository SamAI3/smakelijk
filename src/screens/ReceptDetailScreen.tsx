import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Heart, CalendarPlus, PencilSimple, Trash,
  Minus, Plus, CornersOut, CaretRight, Basket, ListNumbers,
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
}

export default function ReceptDetailScreen({ recept, onBack, onEdit }: Props) {
  const { updateRecept, deleteRecept, addToWeekkeuze, weekkeuze } = useRecepten();
  const [porties, setPorties] = useState(recept.porties);
  const [kookModus, setKookModus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toegevoegd, setToegevoegd] = useState(false);
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

  // ── Kookmodus ──────────────────────────────────────────────
  if (kookModus) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#1A1815', color: '#FAF6F0',
        overflowY: isTablet ? 'hidden' : 'auto', zIndex: 100,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Kookmodus header */}
        <div style={{ padding: '20px 28px 16px', flexShrink: 0 }}>
          <button
            onClick={() => setKookModus(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A09A93', fontSize: 14, marginBottom: 12 }}
          >
            <ArrowLeft size={18} /> Afsluiten
          </button>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: isTablet ? 36 : 26 }}>
            {recept.titel}
          </h1>
          {porties !== recept.porties && (
            <p style={{ fontSize: 13, color: '#A09A93', marginTop: 4 }}>{porties} porties</p>
          )}
        </div>

        {/* Inhoud: side-by-side op tablet, stacked op mobiel */}
        <div style={{
          flex: 1, overflow: 'hidden',
          display: 'flex',
          flexDirection: isTablet ? 'row' : 'column',
          gap: 0,
        }}>
          {/* Ingrediënten */}
          {recept.ingredienten.length > 0 && (
            <div style={{
              width: isTablet ? 300 : '100%',
              flexShrink: 0,
              overflowY: 'auto',
              padding: isTablet ? '0 20px 40px 28px' : '0 20px 16px',
              borderRight: isTablet ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderBottom: isTablet ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-title)', fontSize: isTablet ? 20 : 16,
                color: 'var(--accent3)', marginBottom: 12,
              }}>
                Ingrediënten
              </h2>
              {recept.ingredienten.map((ing, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: '7px 0',
                  borderBottom: i < recept.ingredienten.length - 1
                    ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  gap: 10,
                }}>
                  <span style={{ fontSize: isTablet ? 17 : 15, color: '#E8E4DE' }}>{ing.naam}</span>
                  <span style={{ fontSize: isTablet ? 16 : 14, fontWeight: 600, color: 'var(--accent3)', flexShrink: 0 }}>
                    {ing.hoeveelheid > 0 ? `${formatHoeveelheid(ing.hoeveelheid)} ${ing.eenheid}` : ing.eenheid}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Bereiding */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: isTablet ? '0 28px 40px 24px' : '16px 20px 48px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-title)', fontSize: isTablet ? 20 : 16,
              color: 'var(--accent4)', marginBottom: 16,
            }}>
              Bereiding
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isTablet ? 28 : 20 }}>
              {recept.bereiding.map((stap, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    flexShrink: 0, width: isTablet ? 40 : 32, height: isTablet ? 40 : 32,
                    borderRadius: 10, background: 'var(--cobalt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isTablet ? 16 : 14, fontWeight: 700, color: '#fff',
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: isTablet ? 20 : 18, lineHeight: 1.65, color: '#FAF6F0', marginTop: 4 }}>
                    {stap}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normaal scherm ──────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--card)', padding: '16px 20px 20px', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
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
          <button onClick={onBack} style={{ color: 'var(--text)', display: 'flex' }}>
            <ArrowLeft size={22} />
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={toggleFavoriet} style={{ display: 'flex', color: recept.favoriet ? 'var(--amber)' : '#C0BAB3' }}>
            <Heart size={22} weight={recept.favoriet ? 'fill' : 'regular'} />
          </button>
          <button onClick={() => onEdit(recept)} style={{ display: 'flex', color: 'var(--text-secondary)' }}>
            <PencilSimple size={20} />
          </button>
          <button onClick={() => setConfirmDelete(true)} style={{ display: 'flex', color: 'var(--crimson)' }}>
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
            style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(27,63,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cobalt)' }}
          >
            <Minus size={14} weight="bold" />
          </button>
          <span style={{ fontWeight: 700, fontSize: 17, minWidth: 24, textAlign: 'center', color: 'var(--cobalt)' }}>{porties}</span>
          <button
            onClick={() => setPorties(porties + 1)}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(27,63,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cobalt)' }}
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
                boxShadow: 'var(--shadow)', fontSize: 14, lineHeight: 1.6, color: '#5A554F',
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
