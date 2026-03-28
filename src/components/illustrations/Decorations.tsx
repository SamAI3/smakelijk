/**
 * Decorations — herbruikbare decoratieve SVG-accenten
 * SidebarDecoratie, CookbookIllustration, IngredientsDivider, CardWatermark
 */

interface Props {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Wijnfles + druiven — sidebar bodem decoratie (verticale oriëntatie) */
export function SidebarDecoratie({ width = 80, className, style }: Props) {
  return (
    <svg
      viewBox="0 0 80 120"
      width={width}
      height={width * 1.5}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Wijnfles */}
      <rect x="30" y="36" width="20" height="52" rx="6" fill="white" fillOpacity="0.10" stroke="white" strokeOpacity="0.20" strokeWidth="1.5"/>
      <rect x="32.5" y="22" width="15" height="16" rx="3" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.20" strokeWidth="1.2"/>
      <line x1="40" y1="16" x2="40" y2="22" stroke="white" strokeOpacity="0.30" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="40" cy="14" r="3" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.28" strokeWidth="1"/>
      {/* Etiket */}
      <rect x="32" y="52" width="16" height="20" rx="2" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.18" strokeWidth="0.8"/>
      <line x1="34" y1="58" x2="46" y2="58" stroke="white" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="35" y1="62" x2="45" y2="62" stroke="white" strokeOpacity="0.18" strokeWidth="0.7" strokeLinecap="round"/>
      {/* Druiventrossen links */}
      <circle cx="14" cy="72" r="4" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.18" strokeWidth="0.8"/>
      <circle cx="20" cy="68" r="4" fill="white" fillOpacity="0.10" stroke="white" strokeOpacity="0.15" strokeWidth="0.8"/>
      <circle cx="10" cy="64" r="3.5" fill="white" fillOpacity="0.10" stroke="white" strokeOpacity="0.14" strokeWidth="0.8"/>
      <circle cx="18" cy="76" r="3.5" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.13" strokeWidth="0.8"/>
      <circle cx="12" cy="78" r="3" fill="white" fillOpacity="0.08"/>
      {/* Druivenrank */}
      <path d="M20 60 Q16 54 22 48" fill="none" stroke="white" strokeOpacity="0.20" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M16 50 Q14 46 18 44" fill="none" stroke="white" strokeOpacity="0.16" strokeWidth="1" strokeLinecap="round"/>
      {/* Druiventros rechts */}
      <circle cx="62" cy="72" r="4" fill="white" fillOpacity="0.10" stroke="white" strokeOpacity="0.14" strokeWidth="0.8"/>
      <circle cx="68" cy="68" r="3.5" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.12" strokeWidth="0.8"/>
      <circle cx="58" cy="66" r="3" fill="white" fillOpacity="0.08"/>
      <circle cx="66" cy="76" r="3" fill="white" fillOpacity="0.08"/>
      {/* Bladeren */}
      <path d="M22 48 Q26 42 22 38 Q18 42 22 48 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.18" strokeWidth="0.8"/>
      <path d="M58 54 Q62 48 58 44 Q54 48 58 54 Z" fill="white" fillOpacity="0.10" stroke="white" strokeOpacity="0.14" strokeWidth="0.8"/>
      {/* Olijftakje onderaan */}
      <path d="M28 108 Q24 100 28 94" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="1.2" strokeLinecap="round"/>
      <ellipse cx="24" cy="102" rx="5" ry="2.5" transform="rotate(-20 24 102)" fill="white" fillOpacity="0.14"/>
      <ellipse cx="27" cy="96" rx="5" ry="2.5" transform="rotate(10 27 96)" fill="white" fillOpacity="0.12"/>
      <path d="M52" y1="108 Q56 100 52 94" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/** Open kookboek met lepel — voor instellingen-sectie */
export function CookbookIllustration({ width = 120, className, style }: Props) {
  return (
    <svg
      viewBox="0 0 120 88"
      width={width}
      height={width * (88 / 120)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Linker pagina */}
      <rect x="6" y="10" width="48" height="68" rx="4"
        fill="var(--cobalt)" fillOpacity="0.08"
        stroke="var(--cobalt)" strokeOpacity="0.20" strokeWidth="1.5"/>
      {/* Rechter pagina */}
      <rect x="66" y="10" width="48" height="68" rx="4"
        fill="var(--cobalt)" fillOpacity="0.06"
        stroke="var(--cobalt)" strokeOpacity="0.16" strokeWidth="1.5"/>
      {/* Rugbinding */}
      <path d="M54 10 Q60 14 60 44 Q60 74 54 78 L66 78 Q60 74 60 44 Q60 14 66 10 Z"
        fill="var(--cobalt)" fillOpacity="0.14"
        stroke="var(--cobalt)" strokeOpacity="0.22" strokeWidth="1"/>
      {/* Lijnen linker pagina */}
      <line x1="14" y1="26" x2="46" y2="26" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="34" x2="46" y2="34" stroke="var(--cobalt)" strokeOpacity="0.13" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="14" y1="42" x2="38" y2="42" stroke="var(--cobalt)" strokeOpacity="0.13" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="14" y1="50" x2="46" y2="50" stroke="var(--cobalt)" strokeOpacity="0.11" strokeWidth="1" strokeLinecap="round"/>
      <line x1="14" y1="58" x2="32" y2="58" stroke="var(--cobalt)" strokeOpacity="0.11" strokeWidth="1" strokeLinecap="round"/>
      <line x1="14" y1="66" x2="44" y2="66" stroke="var(--cobalt)" strokeOpacity="0.09" strokeWidth="1" strokeLinecap="round"/>
      {/* Kleine bladillustratie linker pagina */}
      <ellipse cx="34" cy="19" rx="6" ry="3.5" transform="rotate(-10 34 19)"
        fill="var(--olive)" fillOpacity="0.28"/>
      <ellipse cx="24" cy="18" rx="5" ry="3" transform="rotate(15 24 18)"
        fill="var(--olive)" fillOpacity="0.22"/>
      {/* Rechter pagina — recept met ingrediëntenlijst */}
      <line x1="74" y1="20" x2="106" y2="20" stroke="var(--cobalt)" strokeOpacity="0.20" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="77" cy="30" r="2" fill="var(--cobalt)" fillOpacity="0.20"/>
      <line x1="82" y1="30" x2="106" y2="30" stroke="var(--cobalt)" strokeOpacity="0.13" strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="77" cy="38" r="2" fill="var(--cobalt)" fillOpacity="0.18"/>
      <line x1="82" y1="38" x2="100" y2="38" stroke="var(--cobalt)" strokeOpacity="0.11" strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="77" cy="46" r="2" fill="var(--cobalt)" fillOpacity="0.16"/>
      <line x1="82" y1="46" x2="106" y2="46" stroke="var(--cobalt)" strokeOpacity="0.11" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="77" cy="54" r="2" fill="var(--cobalt)" fillOpacity="0.14"/>
      <line x1="82" y1="54" x2="96" y2="54" stroke="var(--cobalt)" strokeOpacity="0.10" strokeWidth="1" strokeLinecap="round"/>
      {/* Sierlepel rechtsboven */}
      <circle cx="100" cy="68" r="7" fill="var(--amber)" fillOpacity="0.18" stroke="var(--amber)" strokeOpacity="0.32" strokeWidth="1.2"/>
      <line x1="100" y1="75" x2="100" y2="84" stroke="var(--amber)" strokeOpacity="0.32" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Boekmarkering */}
      <rect x="44" y="10" width="6" height="14" rx="1" fill="var(--crimson)" fillOpacity="0.30" stroke="var(--crimson)" strokeOpacity="0.20" strokeWidth="0.8"/>
      <path d="M44 24 L47 20 L50 24" fill="var(--crimson)" fillOpacity="0.30" stroke="var(--crimson)" strokeOpacity="0.20" strokeWidth="0.8" strokeLinejoin="round"/>
    </svg>
  );
}

/** Horizontale kruiden-divider — tussen ingrediënten en bereiding */
export function IngredientsDivider({ width = 280, className, style }: Props) {
  return (
    <svg
      viewBox="0 0 280 24"
      width={width}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Lijn links */}
      <line x1="8" y1="12" x2="108" y2="12" stroke="var(--cobalt)" strokeOpacity="0.14" strokeWidth="1" strokeLinecap="round"/>
      {/* Lijn rechts */}
      <line x1="172" y1="12" x2="272" y2="12" stroke="var(--cobalt)" strokeOpacity="0.14" strokeWidth="1" strokeLinecap="round"/>
      {/* Centraal accent — kleiner olijftakje */}
      <path d="M126 14 Q134 6 140 12 Q146 6 154 14" fill="none" stroke="var(--olive)" strokeOpacity="0.40" strokeWidth="1.4" strokeLinecap="round"/>
      <ellipse cx="131" cy="9" rx="4.5" ry="2.5" transform="rotate(-30 131 9)" fill="var(--olive)" fillOpacity="0.30"/>
      <ellipse cx="140" cy="7" rx="4.5" ry="2.5" fill="var(--olive)" fillOpacity="0.26"/>
      <ellipse cx="149" cy="9" rx="4.5" ry="2.5" transform="rotate(30 149 9)" fill="var(--olive)" fillOpacity="0.30"/>
      {/* Kleine stipjes naast lijn */}
      <circle cx="112" cy="12" r="1.5" fill="var(--olive)" fillOpacity="0.22"/>
      <circle cx="168" cy="12" r="1.5" fill="var(--olive)" fillOpacity="0.22"/>
    </svg>
  );
}

/** Subtiele achtergrond-watermark voor receptkaarten (positioneer absoluut rechtsonder) */
export function CardWatermark({ width = 56, className, style }: Props) {
  return (
    <svg
      viewBox="0 0 56 56"
      width={width}
      height={width}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Gestileerde vork — subtiele watermark */}
      <line x1="22" y1="6" x2="22" y2="50" stroke="currentColor" strokeOpacity="0.06" strokeWidth="3" strokeLinecap="round"/>
      <line x1="16" y1="6" x2="16" y2="18" stroke="currentColor" strokeOpacity="0.05" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="28" y1="6" x2="28" y2="18" stroke="currentColor" strokeOpacity="0.05" strokeWidth="2.2" strokeLinecap="round"/>
      {/* Bord */}
      <circle cx="38" cy="36" r="14" stroke="currentColor" strokeOpacity="0.05" strokeWidth="2.5"/>
      <circle cx="38" cy="36" r="9" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1.5"/>
    </svg>
  );
}
