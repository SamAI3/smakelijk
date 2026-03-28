/**
 * Keuken-iconen — 24×24 viewport, strokeLinecap="round", strokeLinejoin="round"
 * Gebruik: <BordBestekIcon className="..." /> of getKeukenIcon(keuken)
 */

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

const BASE = {
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Bord + vork — default / Alle keukens */
export function BordBestekIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      {/* Vork */}
      <line x1="5.5" y1="3" x2="5.5" y2="21" stroke="currentColor" strokeWidth="2"/>
      <line x1="3.5" y1="3" x2="3.5" y2="9" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="7.5" y1="3" x2="7.5" y2="9" stroke="currentColor" strokeWidth="1.6"/>
      {/* Bord */}
      <circle cx="15.5" cy="13" r="7.5" stroke="currentColor" strokeWidth="2"
        fill="currentColor" fillOpacity="0.08"/>
      <circle cx="15.5" cy="13" r="4.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    </svg>
  );
}

/** Croissant — Frans */
export function CroissantIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      <path
        d="M2.5 17 Q4 8 12 5 Q20 2 21.5 7 Q23 12 18 16 Q13 20 8 20.5 Q3.5 20.5 2.5 17 Z"
        stroke="currentColor" strokeWidth="2"
        fill="currentColor" fillOpacity="0.12"/>
      <path d="M6 17 Q10 12 15 10" stroke="currentColor" strokeWidth="1.2" opacity="0.55"/>
      <path d="M8 19 Q12 14 17 12" stroke="currentColor" strokeWidth="1" opacity="0.35"/>
    </svg>
  );
}

/** Pasta op vork — Italiaans */
export function PastaVorkIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      {/* Pasta nest */}
      <path
        d="M3 11 Q7 6 12 10 Q17 6 21 11 Q17 15 12 11 Q7 15 3 11 Z"
        stroke="currentColor" strokeWidth="1.8"
        fill="currentColor" fillOpacity="0.12"/>
      {/* Vork */}
      <line x1="12" y1="11" x2="12" y2="21" stroke="currentColor" strokeWidth="2.2"/>
      <line x1="10" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="12" y1="4" x2="12" y2="10" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

/** Kom met eetstokjes — Aziatisch / Thais */
export function KomEetstokjesIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      {/* Eetstokjes gekruist */}
      <line x1="7" y1="2" x2="18" y2="10" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="17" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.8"/>
      {/* Rand */}
      <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="2"/>
      {/* Kom */}
      <path
        d="M4 12 Q4 21 12 22 Q20 21 20 12 Z"
        stroke="currentColor" strokeWidth="2"
        fill="currentColor" fillOpacity="0.10"/>
    </svg>
  );
}

/** Onigiri — Japans */
export function OnigiriIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      {/* Rijstbal vorm */}
      <path
        d="M12 2 Q5.5 5 4 12 Q3.5 18 12 21 Q20.5 18 20 12 Q18.5 5 12 2 Z"
        stroke="currentColor" strokeWidth="2"
        fill="currentColor" fillOpacity="0.1"/>
      {/* Nori strook */}
      <path d="M5 15.5 Q12 18 19 15.5"
        stroke="currentColor" strokeWidth="3.5" opacity="0.45"/>
    </svg>
  );
}

/** Peper — Mexicaans / Spaans */
export function PeperIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      {/* Steeltje */}
      <path d="M12 2 Q15 4 13 6.5" stroke="currentColor" strokeWidth="1.8"/>
      {/* Paprika-lichaam */}
      <path
        d="M13 6.5 Q7 7.5 6 12 Q5 17 9 19.5 Q12 21.5 15 19.5 Q19 17 18 12 Q17 7.5 11 6.5 Z"
        stroke="currentColor" strokeWidth="2"
        fill="currentColor" fillOpacity="0.12"/>
      {/* Middenrib */}
      <path d="M12 8 Q11.5 13.5 12 19" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}

/** Brood/stokbrood — Nederlands */
export function BroodIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      <path
        d="M3 14 Q3 8 12 7 Q21 8 21 14 Q21 19 12 20 Q3 19 3 14 Z"
        stroke="currentColor" strokeWidth="2"
        fill="currentColor" fillOpacity="0.12"/>
      {/* Snijstrepen */}
      <path d="M6 10 Q7 7.5 8 10" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M10 9 Q11 6.5 12 9" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M14 9 Q15 6.5 16 9" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M18 10 Q19 7.5 20 10" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}

/** Kruidenpotje / specerijenpot — Indiaas / Arabisch */
export function KruidenPotIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...BASE} xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden>
      {/* Pot */}
      <path
        d="M6 9 Q6 18 12 19 Q18 18 18 9 Z"
        stroke="currentColor" strokeWidth="2"
        fill="currentColor" fillOpacity="0.12"/>
      {/* Rand */}
      <path d="M4 9 Q4 7 12 7 Q20 7 20 9 L20 10 Q12 11 4 10 Z"
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
      {/* Stoom */}
      <path d="M9 4 Q10 2 9 1" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M12 5 Q13 3 12 1" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M15 4 Q16 2 15 1" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}

/** Geeft het juiste icoon voor een keuken-naam */
export function GetKeukenIcon({ keuken, ...props }: { keuken: string } & IconProps) {
  const k = keuken.toLowerCase();
  if (k.includes('fran') || k.includes('franc')) return <CroissantIcon {...props}/>;
  if (k.includes('italiaan') || k.includes('ital')) return <PastaVorkIcon {...props}/>;
  if (k.includes('japans') || k.includes('japan')) return <OnigiriIcon {...props}/>;
  if (k.includes('aziatisch') || k.includes('thais') || k.includes('chinees') || k.includes('vietname'))
    return <KomEetstokjesIcon {...props}/>;
  if (k.includes('mexicaan') || k.includes('spaans') || k.includes('spain'))
    return <PeperIcon {...props}/>;
  if (k.includes('nederland') || k.includes('dutch')) return <BroodIcon {...props}/>;
  if (k.includes('indiaas') || k.includes('india') || k.includes('arabisch') || k.includes('midden'))
    return <KruidenPotIcon {...props}/>;
  return <BordBestekIcon {...props}/>;
}
