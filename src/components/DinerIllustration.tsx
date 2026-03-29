/**
 * DinerIllustration — handgetekende diner-scène (cobalt + crimson op crème)
 * Pad: /illustrations/diner-scene.png
 *
 * Gebruik `section` om specifieke delen van de illustratie te tonen via
 * CSS object-position cropping. Styling via `style` of `className`.
 */

export type DinerSection = 'full' | 'wine' | 'olive' | 'bread' | 'cheese' | 'candle';

interface DinerIllustrationProps {
  section?: DinerSection;
  className?: string;
  style?: React.CSSProperties;
  /** Alt-tekst; standaard aria-hidden */
  alt?: string;
  loading?: 'lazy' | 'eager';
}

const sectionPositions: Record<DinerSection, string> = {
  full:   'center 65%',  // wijnfles, glazen, brood — het rijkste deel
  wine:   '70% 55%',    // wijnfles + gevuld glas rechts
  olive:  '80% 5%',     // olijftak rechtsboven
  bread:  '82% 88%',    // stokbrood + pastabord rechtsonder
  cheese: '48% 38%',    // kaas + olijven midden
  candle: '32% 18%',    // kaars + leeg glas linksboven
};

export default function DinerIllustration({
  section = 'full',
  className,
  style,
  alt,
  loading = 'lazy',
}: DinerIllustrationProps) {
  const position = sectionPositions[section];

  return (
    <img
      src="/illustrations/diner-scene.png"
      alt={alt ?? ''}
      aria-hidden={alt === undefined}
      loading={loading}
      className={className}
      style={{
        objectFit: 'cover',
        objectPosition: position,
        display: 'block',
        ...style,
      }}
    />
  );
}
