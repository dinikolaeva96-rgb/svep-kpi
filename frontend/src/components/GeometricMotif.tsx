interface GeometricMotifProps {
  variant: 'header' | 'watermark' | 'ghost' | 'hero'
  className?: string
}

/* СВЭП crystal symbol — asymmetric diamond outline with internal
   facet diagonals, per brand-book geometry. Stroke-only, no fill.
   Color/opacity are controlled by the caller via `className` using
   currentColor, except `ghost` which bakes in a fixed low opacity. */

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

/* Asymmetric 9-point outer contour, clockwise from upper-left vertex */
const POINTS = '28,2 72,8 88,28 82,72 62,95 35,90 8,68 2,42 12,18'

const DIAGONALS: [string, string][] = [
  ['28,2',  '82,72'],
  ['72,8',  '8,68'],
  ['2,42',  '62,95'],
  ['12,18', '88,28'],
  ['35,90', '88,28'],
  ['2,42',  '88,28'],
]

export default function GeometricMotif({ variant, className }: GeometricMotifProps) {
  const size = SIZE[variant]
  const strokeWidth = STROKE[variant]

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={POSITION[variant]}
    >
      <polygon
        points={POINTS}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {DIAGONALS.map(([a, b], i) => {
        const [x1, y1] = a.split(',')
        const [x2, y2] = b.split(',')
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
