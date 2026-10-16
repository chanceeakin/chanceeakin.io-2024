// Flat geometric glyphs in the spirit of mid-century furniture drawings.
const base = { fill: "currentColor", "aria-hidden": true } as const;

export const Starburst = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} {...base}>
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x="48.5" y="4" width="3" height="30" rx="1.5" transform={`rotate(${i * 30} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="7" />
  </svg>
);

export const Lamp = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} {...base}>
    <circle cx="50" cy="40" r="22" />
    <rect x="49" y="62" width="2" height="30" />
    <rect x="34" y="90" width="32" height="3" rx="1.5" />
  </svg>
);

export const Arc = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} {...base}>
    <path d="M10 70 A40 40 0 0 1 90 70 Z" />
    <rect x="10" y="76" width="80" height="4" rx="2" />
  </svg>
);

export const Shelf = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} {...base}>
    <rect x="26" y="8" width="3" height="84" />
    <rect x="71" y="8" width="3" height="84" />
    {[24, 46, 68, 90].map((y) => (
      <rect key={y} x="26" y={y} width="48" height="3" />
    ))}
    <circle cx="40" cy="18" r="5" />
    <rect x="52" y="52" width="14" height="14" />
  </svg>
);
