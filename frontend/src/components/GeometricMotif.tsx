interface GeometricMotifProps {
  variant: 'header' | 'watermark' | 'ghost' | 'hero'
  className?: string
}

/* СВЭП crystal symbol — irregular ~10-point faceted polygon with
   crossing internal diagonals. Stroke-only, no fill. Color/opacity
   are controlled by the caller via `className` using currentColor,
   except `ghost` which bakes in a fixed low opacity per spec. */

const SIZE: Record<GeometricMotifProps['variant'], number> = {
  header: 28,
  watermark: 260,
  ghost: 100,
  hero: 280,
}

const STROKE: Record<GeometricMotifProps['variant'], number> = {
  header: 1.5,
  watermark: 0.6,
  ghost: 1,
  hero: 1.5,
}

const POSITION: Record<GeometricMotifProps['variant'], React.CSSProperties> = {
  header: {},
  watermark: { position: 'absolute', top: 0, right: 0, pointerEvents: 'none' },
  ghost: { position: 'absolute', pointerEvents: 'none', opacity: 0.06 },
  hero: {},
}

/* Irregular 10-point polygon, elongated, faceted like a cut crystal */
const POINTS = '50,2 72,10 92,34 96,60 84,92 64,124 38,126 16,98 4,62 12,28'

const DIAGONALS: [string, string][] = [
  ['50,2', '64,124'],
  ['50,2', '38,126'],
  ['72,10', '16,98'],
  ['92,34', '38,126'],
  ['4,62', '84,92'],
  ['12,28', '96,60'],
]

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
        points={POINTS}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {DIAGONALS.map(([a, b], i) => {
        const [x1, y1] = a.split(',')
        const [x2, y2] = b.split(',')
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={strokeWidth} />
      })}
    </svg>
  )
}
