/**
 * EmptyStates — illustraties voor lege-toestand schermen
 */

interface Props {
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Wachtend leeg bord — weekkeuze lege staat */
export function WeekLegeState({ width = 160, className, style }: Props) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={width}
      height={width}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Placematje */}
      <ellipse cx="80" cy="88" rx="68" ry="52" fill="var(--cobalt)" fillOpacity="0.06" stroke="var(--cobalt)" strokeOpacity="0.13" strokeWidth="1.5"/>

      {/* Bord */}
      <circle cx="80" cy="88" r="42" fill="var(--card)" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="2"/>
      <circle cx="80" cy="88" r="32" fill="none" stroke="var(--cobalt)" strokeOpacity="0.09" strokeWidth="1.2" strokeDasharray="4 3"/>
      <circle cx="80" cy="88" r="18" fill="var(--cobalt)" fillOpacity="0.04"/>

      {/* Vraagteken / wachtend gevoel — gestippelde cirkel in bord */}
      <path d="M74 82 Q74 76 80 76 Q86 76 86 82 Q86 86 80 88" stroke="var(--cobalt)" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="80" cy="93" r="1.5" fill="var(--cobalt)" fillOpacity="0.22"/>

      {/* Vork */}
      <line x1="26" y1="68" x2="26" y2="110" stroke="var(--ink)" strokeOpacity="0.20" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="68" x2="22" y2="78" stroke="var(--ink)" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="30" y1="68" x2="30" y2="78" stroke="var(--ink)" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Mes */}
      <line x1="134" y1="68" x2="134" y2="110" stroke="var(--ink)" strokeOpacity="0.20" strokeWidth="2" strokeLinecap="round"/>
      <path d="M134 68 Q140 76 134 84" fill="none" stroke="var(--ink)" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round"/>

      {/* Servetje */}
      <path d="M108 56 L122 50 L124 68 Z" fill="var(--cobalt)" fillOpacity="0.10" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="1" strokeLinejoin="round"/>

      {/* Olijftak sierlijk */}
      <path d="M50 28 Q40 40 44 56" fill="none" stroke="var(--olive)" strokeOpacity="0.38" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="44" cy="35" rx="6" ry="3" transform="rotate(-25 44 35)" fill="var(--olive)" fillOpacity="0.30"/>
      <ellipse cx="42" cy="44" rx="6" ry="3" transform="rotate(10 42 44)" fill="var(--olive)" fillOpacity="0.26"/>
      <ellipse cx="44" cy="52" rx="5" ry="2.5" transform="rotate(-5 44 52)" fill="var(--olive)" fillOpacity="0.22"/>

      {/* Kalender icoon hints */}
      <rect x="100" y="18" width="24" height="22" rx="4" fill="var(--amber)" fillOpacity="0.15" stroke="var(--amber)" strokeOpacity="0.32" strokeWidth="1.2"/>
      <line x1="100" y1="25" x2="124" y2="25" stroke="var(--amber)" strokeOpacity="0.32" strokeWidth="1"/>
      <circle cx="108" cy="31" r="1.5" fill="var(--amber)" fillOpacity="0.40"/>
      <circle cx="116" cy="31" r="1.5" fill="var(--amber)" fillOpacity="0.40"/>
      <circle cx="108" cy="36" r="1.5" fill="var(--amber)" fillOpacity="0.30"/>

      {/* Plus teken hint — "voeg toe" */}
      <circle cx="80" cy="140" r="14" fill="var(--cobalt)" fillOpacity="0.10" stroke="var(--cobalt)" strokeOpacity="0.20" strokeWidth="1.2"/>
      <line x1="80" y1="134" x2="80" y2="146" stroke="var(--cobalt)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round"/>
      <line x1="74" y1="140" x2="86" y2="140" stroke="var(--cobalt)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/** Lege receptenlijst illustratie */
export function ReceptenLegeState({ width = 120, className, style }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={width}
      height={width}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Opengeslagen kookboek */}
      <rect x="12" y="28" width="44" height="60" rx="4" fill="var(--cobalt)" fillOpacity="0.10" stroke="var(--cobalt)" strokeOpacity="0.22" strokeWidth="1.5"/>
      <rect x="64" y="28" width="44" height="60" rx="4" fill="var(--cobalt)" fillOpacity="0.07" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="1.5"/>
      {/* Rug boek */}
      <rect x="54" y="28" width="12" height="60" rx="2" fill="var(--cobalt)" fillOpacity="0.18" stroke="var(--cobalt)" strokeOpacity="0.28" strokeWidth="1"/>
      {/* Regels op linker pagina */}
      <line x1="20" y1="44" x2="48" y2="44" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="52" x2="48" y2="52" stroke="var(--cobalt)" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="20" y1="60" x2="40" y2="60" stroke="var(--cobalt)" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="20" y1="68" x2="48" y2="68" stroke="var(--cobalt)" strokeOpacity="0.12" strokeWidth="1" strokeLinecap="round"/>
      <line x1="20" y1="76" x2="36" y2="76" stroke="var(--cobalt)" strokeOpacity="0.12" strokeWidth="1" strokeLinecap="round"/>
      {/* Rechter pagina — leeg met stippellijn */}
      <line x1="72" y1="44" x2="100" y2="44" stroke="var(--cobalt)" strokeOpacity="0.10" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2"/>
      <line x1="72" y1="54" x2="100" y2="54" stroke="var(--cobalt)" strokeOpacity="0.10" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2"/>
      <line x1="72" y1="64" x2="90" y2="64" stroke="var(--cobalt)" strokeOpacity="0.08" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2"/>
      {/* Plus teken rechts */}
      <line x1="86" y1="78" x2="86" y2="88" stroke="var(--crimson)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round"/>
      <line x1="81" y1="83" x2="91" y2="83" stroke="var(--crimson)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
