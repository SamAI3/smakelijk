interface IllustrationProps {
  size?: number;
  color?: string;
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
