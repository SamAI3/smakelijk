interface IllustrationProps {
  size?: number;
  color?: string;
}

/** Wijnfles silhouet — vlakke vorm, bistro-poster stijl */
export function WijnflesSilhouet({ size = 56, color = 'var(--cobalt)' }: IllustrationProps) {
  return (
    <svg width={size} height={Math.round(size * 2.2)} viewBox="0 0 56 123" fill="none" aria-hidden>
      {/* Capsule */}
      <rect x="20" y="0" width="16" height="14" rx="4" fill={color} />
      {/* Kurk */}
      <rect x="23" y="13" width="10" height="5" rx="1" fill={color} opacity="0.6" />
      {/* Hals */}
      <rect x="22" y="18" width="12" height="26" fill={color} />
      {/* Schouder + romp */}
      <path d="M22 44 C14 52 9 64 9 76 L9 108 C9 115 13 119 20 119 L36 119 C43 119 47 115 47 108 L47 76 C47 64 42 52 34 44 Z" fill={color} />
      {/* Label rechthoek op romp */}
      <rect x="14" y="75" width="28" height="22" rx="3" fill="white" opacity="0.18" />
    </svg>
  );
}

/** Wijnglas — line-art stijl, dunne lijnen */
export function WijnglasSilhouet({ size = 56, color = 'var(--crimson)' }: IllustrationProps) {
  return (
    <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 56 84" fill="none" aria-hidden>
      {/* Kelk */}
      <path
        d="M10 6 L46 6 Q46 8 44 18 Q40 38 28 46 Q16 38 12 18 Q10 8 10 6 Z"
        fill={color}
        opacity="0.15"
      />
      <path
        d="M10 6 L46 6 Q46 8 44 18 Q40 38 28 46 Q16 38 12 18 Q10 8 10 6 Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Stengel */}
      <line x1="28" y1="46" x2="28" y2="72" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Voet */}
      <path d="M14 72 Q28 76 42 72" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Vloeistof */}
      <path
        d="M13 22 Q15 32 28 38 Q41 32 43 22 Z"
        fill={color}
        opacity="0.35"
      />
    </svg>
  );
}

/** Olijftak — decoratief botanisch element */
export function OlijftakDecoratie({ size = 80, color = 'var(--olive)' }: IllustrationProps) {
  return (
    <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 80 60" fill="none" aria-hidden>
      {/* Hoofdtak */}
      <path d="M8 54 C14 42 24 28 40 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Zijtakken + bladeren links */}
      <path d="M17 40 C12 34 8 30 6 26" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="8" cy="24" rx="7" ry="4" fill={color} transform="rotate(-35 8 24)" />
      <path d="M24 28 C18 24 15 20 14 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="15" cy="14" rx="6" ry="3.5" fill={color} transform="rotate(-50 15 14)" />
      {/* Bladeren rechts */}
      <path d="M20 42 C26 36 30 32 34 30" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="35" cy="29" rx="6" ry="3.5" fill={color} transform="rotate(10 35 29)" />
      <path d="M29 30 C35 24 38 20 40 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="41" cy="14" rx="6" ry="3.5" fill={color} transform="rotate(-10 41 14)" />
      {/* Kleine olijfjes */}
      <circle cx="16" cy="38" r="3" fill={color} opacity="0.7" />
      <circle cx="32" cy="22" r="2.5" fill={color} opacity="0.7" />
      <circle cx="38" cy="12" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

/** Bestek (vork + mes) — gestileerd, bistro-poster stijl */
export function BestekDecoratie({ size = 48, color = 'var(--cobalt)' }: IllustrationProps) {
  return (
    <svg width={size} height={Math.round(size * 1.8)} viewBox="0 0 48 86" fill="none" aria-hidden>
      {/* Vork — links */}
      {/* Steel */}
      <rect x="9" y="36" width="5" height="46" rx="2.5" fill={color} />
      {/* Handvat-knobbel */}
      <rect x="8" y="70" width="7" height="14" rx="3.5" fill={color} />
      {/* Tanden */}
      <rect x="9" y="4" width="2" height="20" rx="1" fill={color} />
      <rect x="13" y="4" width="2" height="20" rx="1" fill={color} />
      <rect x="17" y="4" width="2" height="20" rx="1" fill={color} />
      {/* Tanden verbinding */}
      <path d="M9 24 Q11 34 14 36 Q17 34 19 24" stroke={color} strokeWidth="2" fill={color} opacity="0.4" />
      {/* Mes — rechts */}
      {/* Steel */}
      <rect x="34" y="36" width="5" height="46" rx="2.5" fill={color} />
      {/* Handvat-knobbel */}
      <rect x="33" y="70" width="7" height="14" rx="3.5" fill={color} />
      {/* Lemmet */}
      <path d="M36 6 L39 10 Q41 18 40 36 L34 36 Q34 18 36 6 Z" fill={color} />
    </svg>
  );
}

/** Bord met decoratieve rand — bistro/linosnede stijl */
export function BordDecoratie({ size = 80, color = 'var(--cobalt)' }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden>
      {/* Buitenste decoratieve rand (golvend) */}
      <path
        d="M40 4 C46 4 50 8 54 8 C58 8 62 4 66 6 C70 8 70 14 72 18 C74 22 78 24 78 28 C78 32 74 36 74 40 C74 44 78 48 76 52 C74 56 70 56 68 60 C66 64 68 70 64 72 C60 74 56 72 52 74 C48 76 46 80 40 78 C34 80 32 76 28 74 C24 72 20 74 16 72 C12 70 14 64 12 60 C10 56 6 56 4 52 C2 48 6 44 6 40 C6 36 2 32 2 28 C2 24 6 22 8 18 C10 14 10 8 14 6 C18 4 22 8 26 8 C30 8 34 4 40 4 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      {/* Binnenste cirkel */}
      <circle cx="40" cy="40" r="26" stroke={color} strokeWidth="2" fill="none" />
      {/* Middelste cirkel */}
      <circle cx="40" cy="40" r="18" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Centraal punt */}
      <circle cx="40" cy="40" r="3" fill={color} opacity="0.4" />
    </svg>
  );
}
