interface GeometricMotifProps {
  variant: 'header' | 'watermark' | 'ghost'
  className?: string
}

/* Elongated pentagon with crossing diagonals — СВЭП crystal symbol.
   Color and opacity are controlled by the caller via `className`
   (text-* for color, opacity-* for transparency) using currentColor,
   except `ghost` which bakes in a fixed low opacity per spec. */

const SIZE: Record<GeometricMotifProps['variant'], number> = {
  header: 28,
  watermark: 260,
  ghost: 100,
}

const STROKE: Record<GeometricMotifProps['variant'], number> = {
  header: 1.6,
  watermark: 0.5,
  ghost: 1,
}

const POSITION: Record<GeometricMotifProps['variant'], React.CSSProperties> = {
  header: {},
  watermark: { position: 'absolute', top: 0, right: 0, pointerEvents: 'none' },
  ghost: { position: 'absolute', pointerEvents: 'none', opacity: 0.06 },
}

export default function GeometricMotif({ variant, className }: GeometricMotifProps) {
  const size = SIZE[variant]
  const strokeWidth = STROKE[variant]

  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={Math.round(size * 1.3)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={POSITION[variant]}
    >
      <polygon
        points="50,4 90,38 78,124 22,124 10,38"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <line x1="50" y1="4"  x2="78" y2="124" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="50" y1="4"  x2="22" y2="124" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="10" y1="38" x2="78" y2="124" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="90" y1="38" x2="22" y2="124" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="10" y1="38" x2="90" y2="38"  stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="50" y1="4"  x2="50" y2="124" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}
