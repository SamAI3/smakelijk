/**
 * HeroIllustration — bird's-eye gedekte tafel voor Recepten-header & Login
 * Gebruik: <TafelHeroIllustration width={...} /> of <LoginTafelIllustration />
 */

interface IllustratieProps {
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Compacte bird's-eye tafel — Recepten-header decoratie */
export function TafelHeroIllustration({ width = 320, className, style }: IllustratieProps) {
  return (
    <svg
      viewBox="0 0 320 160"
      width={width}
      height={width * 0.5}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Tafelkleed / tafelblad */}
      <ellipse cx="160" cy="80" rx="148" ry="68" fill="var(--cobalt)" fillOpacity="0.06" stroke="var(--cobalt)" strokeOpacity="0.12" strokeWidth="1.5"/>

      {/* Placematje links */}
      <ellipse cx="80" cy="80" rx="52" ry="38" fill="var(--cobalt)" fillOpacity="0.07" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="1.2"/>

      {/* Bord links */}
      <circle cx="80" cy="80" r="28" fill="var(--card)" stroke="var(--cobalt)" strokeOpacity="0.20" strokeWidth="1.5"/>
      <circle cx="80" cy="80" r="20" fill="none" stroke="var(--cobalt)" strokeOpacity="0.10" strokeWidth="1"/>

      {/* Vork links */}
      <line x1="44" y1="62" x2="44" y2="100" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round"/>
      <line x1="41" y1="62" x2="41" y2="71" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="47" y1="62" x2="47" y2="71" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Mes links */}
      <line x1="117" y1="62" x2="117" y2="100" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round"/>
      <path d="M117 62 Q122 68 117 74" fill="none" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.2" strokeLinecap="round"/>

      {/* Placematje rechts */}
      <ellipse cx="240" cy="80" rx="52" ry="38" fill="var(--crimson)" fillOpacity="0.06" stroke="var(--crimson)" strokeOpacity="0.15" strokeWidth="1.2"/>

      {/* Bord rechts */}
      <circle cx="240" cy="80" r="28" fill="var(--card)" stroke="var(--crimson)" strokeOpacity="0.18" strokeWidth="1.5"/>
      <circle cx="240" cy="80" r="20" fill="none" stroke="var(--crimson)" strokeOpacity="0.10" strokeWidth="1"/>

      {/* Vork rechts */}
      <line x1="203" y1="62" x2="203" y2="100" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round"/>
      <line x1="200" y1="62" x2="200" y2="71" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="206" y1="62" x2="206" y2="71" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Mes rechts */}
      <line x1="277" y1="62" x2="277" y2="100" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round"/>
      <path d="M277 62 Q282 68 277 74" fill="none" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.2" strokeLinecap="round"/>

      {/* Wijnfles midden-boven */}
      <rect x="154" y="14" width="12" height="28" rx="4" fill="var(--cobalt)" fillOpacity="0.18" stroke="var(--cobalt)" strokeOpacity="0.30" strokeWidth="1.2"/>
      <rect x="156" y="8" width="8" height="8" rx="2" fill="var(--cobalt)" fillOpacity="0.22" stroke="var(--cobalt)" strokeOpacity="0.30" strokeWidth="1"/>
      <line x1="160" y1="12" x2="160" y2="14" stroke="var(--cobalt)" strokeOpacity="0.40" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Wijnglas midden-rechts */}
      <path d="M172 38 Q168 50 170 56 L178 56 Q180 50 176 38 Z" fill="var(--amber)" fillOpacity="0.14" stroke="var(--amber)" strokeOpacity="0.35" strokeWidth="1.2" strokeLinejoin="round"/>
      <line x1="174" y1="56" x2="174" y2="64" stroke="var(--amber)" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="170" y1="64" x2="178" y2="64" stroke="var(--amber)" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Broodje midden-links */}
      <ellipse cx="148" cy="56" rx="10" ry="7" fill="var(--amber)" fillOpacity="0.20" stroke="var(--amber)" strokeOpacity="0.35" strokeWidth="1.2"/>
      <path d="M140 54 Q148 50 156 54" fill="none" stroke="var(--amber)" strokeOpacity="0.28" strokeWidth="1" strokeLinecap="round"/>

      {/* Olijftak decoratie rechtsboven */}
      <path d="M285 24 Q295 32 290 44" fill="none" stroke="var(--olive)" strokeOpacity="0.40" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="290" cy="30" rx="5" ry="3" transform="rotate(-20 290 30)" fill="var(--olive)" fillOpacity="0.28"/>
      <ellipse cx="293" cy="37" rx="5" ry="3" transform="rotate(15 293 37)" fill="var(--olive)" fillOpacity="0.28"/>
      <ellipse cx="289" cy="42" rx="4" ry="2.5" transform="rotate(-10 289 42)" fill="var(--olive)" fillOpacity="0.28"/>

      {/* Olijftak linksonder */}
      <path d="M35 130 Q25 118 30 106" fill="none" stroke="var(--olive)" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="30" cy="124" rx="5" ry="3" transform="rotate(20 30 124)" fill="var(--olive)" fillOpacity="0.25"/>
      <ellipse cx="27" cy="117" rx="5" ry="3" transform="rotate(-15 27 117)" fill="var(--olive)" fillOpacity="0.25"/>

      {/* Kleine bessen / decoratieve stippen */}
      <circle cx="160" cy="105" r="2.5" fill="var(--crimson)" fillOpacity="0.20"/>
      <circle cx="166" cy="108" r="2" fill="var(--crimson)" fillOpacity="0.15"/>
      <circle cx="154" cy="108" r="2" fill="var(--crimson)" fillOpacity="0.15"/>
    </svg>
  );
}

/** Uitgebreide login-illustratie — rijkelijk gedekte tafel, poster-stijl */
export function LoginTafelIllustration({ width = 280, className, style }: IllustratieProps) {
  return (
    <svg
      viewBox="0 0 280 200"
      width={width}
      height={width * (200 / 280)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Tafelblad */}
      <ellipse cx="140" cy="110" rx="128" ry="80" fill="var(--cobalt)" fillOpacity="0.08" stroke="var(--cobalt)" strokeOpacity="0.14" strokeWidth="1.5"/>

      {/* Tafelkleed-randen */}
      <ellipse cx="140" cy="110" rx="120" ry="72" fill="none" stroke="var(--cobalt)" strokeOpacity="0.07" strokeWidth="3" strokeDasharray="6 4"/>

      {/* Groot centraal bord */}
      <circle cx="140" cy="112" r="42" fill="var(--card)" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="2"/>
      <circle cx="140" cy="112" r="32" fill="none" stroke="var(--cobalt)" strokeOpacity="0.09" strokeWidth="1.5"/>
      <circle cx="140" cy="112" r="18" fill="var(--cobalt)" fillOpacity="0.05"/>

      {/* Garnering op centraal bord — kleine bladeren */}
      <ellipse cx="132" cy="108" rx="5" ry="3" transform="rotate(-30 132 108)" fill="var(--olive)" fillOpacity="0.35"/>
      <ellipse cx="140" cy="104" rx="5" ry="3" transform="rotate(0 140 104)" fill="var(--olive)" fillOpacity="0.30"/>
      <ellipse cx="148" cy="108" rx="5" ry="3" transform="rotate(30 148 108)" fill="var(--olive)" fillOpacity="0.35"/>

      {/* Vork */}
      <line x1="84" y1="88" x2="84" y2="138" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="80" y1="88" x2="80" y2="100" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="84" y1="88" x2="84" y2="100" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="88" y1="88" x2="88" y2="100" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="1.6" strokeLinecap="round"/>

      {/* Mes */}
      <line x1="196" y1="88" x2="196" y2="138" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M196 88 Q203 98 196 108" fill="none" stroke="var(--ink)" strokeOpacity="0.20" strokeWidth="1.4" strokeLinecap="round"/>

      {/* Servet links — gevouwen driehoek */}
      <path d="M56 100 L72 90 L74 116 Z" fill="var(--cobalt)" fillOpacity="0.12" stroke="var(--cobalt)" strokeOpacity="0.22" strokeWidth="1.2" strokeLinejoin="round"/>

      {/* Wijnfles rechtsboven */}
      <rect x="214" y="50" width="14" height="34" rx="5" fill="var(--cobalt)" fillOpacity="0.20" stroke="var(--cobalt)" strokeOpacity="0.32" strokeWidth="1.5"/>
      <rect x="216.5" y="40" width="9" height="12" rx="2.5" fill="var(--cobalt)" fillOpacity="0.24" stroke="var(--cobalt)" strokeOpacity="0.30" strokeWidth="1.2"/>
      <line x1="221" y1="44" x2="221" y2="50" stroke="var(--cobalt)" strokeOpacity="0.45" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="214" y1="68" x2="228" y2="68" stroke="var(--cobalt)" strokeOpacity="0.18" strokeWidth="1" strokeLinecap="round"/>

      {/* Wijnglas rechts */}
      <path d="M230 80 Q226 94 228 102 L238 102 Q240 94 236 80 Z" fill="var(--amber)" fillOpacity="0.18" stroke="var(--amber)" strokeOpacity="0.38" strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="233" y1="102" x2="233" y2="114" stroke="var(--amber)" strokeOpacity="0.38" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="228" y1="114" x2="238" y2="114" stroke="var(--amber)" strokeOpacity="0.40" strokeWidth="1.8" strokeLinecap="round"/>

      {/* Brood / stokbrood linksboven */}
      <path d="M42 74 Q52 66 72 70 Q82 72 80 80 Q78 88 66 88 Q50 88 42 82 Z" fill="var(--amber)" fillOpacity="0.18" stroke="var(--amber)" strokeOpacity="0.35" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M50 74 Q52 70 54 74" fill="none" stroke="var(--amber)" strokeOpacity="0.30" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M58 72 Q60 68 62 72" fill="none" stroke="var(--amber)" strokeOpacity="0.30" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M66 73 Q68 69 70 73" fill="none" stroke="var(--amber)" strokeOpacity="0.28" strokeWidth="1.1" strokeLinecap="round"/>

      {/* Kaarsvlam midden-boven */}
      <rect x="136" y="46" width="8" height="20" rx="2" fill="var(--amber)" fillOpacity="0.22" stroke="var(--amber)" strokeOpacity="0.32" strokeWidth="1"/>
      <path d="M140 36 Q137 40 138 44 Q140 46 142 44 Q143 40 140 36 Z" fill="var(--amber)" fillOpacity="0.55" stroke="var(--amber)" strokeOpacity="0.50" strokeWidth="0.8"/>
      <line x1="136" y1="66" x2="144" y2="66" stroke="var(--amber)" strokeOpacity="0.22" strokeWidth="1"/>

      {/* Olijftakken decoratie */}
      <path d="M18 80 Q12 96 20 112" fill="none" stroke="var(--olive)" strokeOpacity="0.42" strokeWidth="1.8" strokeLinecap="round"/>
      <ellipse cx="14" cy="88" rx="6" ry="3.5" transform="rotate(-20 14 88)" fill="var(--olive)" fillOpacity="0.32"/>
      <ellipse cx="16" cy="98" rx="6" ry="3.5" transform="rotate(10 16 98)" fill="var(--olive)" fillOpacity="0.28"/>
      <ellipse cx="19" cy="107" rx="5" ry="3" transform="rotate(-5 19 107)" fill="var(--olive)" fillOpacity="0.25"/>

      <path d="M262 130 Q268 114 260 100" fill="none" stroke="var(--olive)" strokeOpacity="0.38" strokeWidth="1.8" strokeLinecap="round"/>
      <ellipse cx="267" cy="122" rx="6" ry="3.5" transform="rotate(25 267 122)" fill="var(--olive)" fillOpacity="0.28"/>
      <ellipse cx="265" cy="113" rx="6" ry="3.5" transform="rotate(-10 265 113)" fill="var(--olive)" fillOpacity="0.25"/>
      <ellipse cx="261" cy="104" rx="5" ry="3" transform="rotate(5 261 104)" fill="var(--olive)" fillOpacity="0.22"/>

      {/* Kleine decoratieve stippen — peper o.i.d. */}
      <circle cx="110" cy="148" r="2" fill="var(--crimson)" fillOpacity="0.22"/>
      <circle cx="116" cy="152" r="1.5" fill="var(--crimson)" fillOpacity="0.18"/>
      <circle cx="170" cy="148" r="2" fill="var(--crimson)" fillOpacity="0.22"/>
      <circle cx="164" cy="152" r="1.5" fill="var(--crimson)" fillOpacity="0.18"/>

      {/* Subtiele tafelrand slagschaduw */}
      <ellipse cx="140" cy="188" rx="110" ry="8" fill="var(--ink)" fillOpacity="0.04"/>
    </svg>
  );
}
