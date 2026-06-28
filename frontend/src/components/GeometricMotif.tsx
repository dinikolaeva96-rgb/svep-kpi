import type { CSSProperties } from 'react'

interface GeometricMotifProps {
  variant?: 'header' | 'watermark' | 'ghost' | 'hero' | 'sidebar'
  size?: number
  color?: string
  opacity?: number
  className?: string
  style?: CSSProperties
}

/* Crystal outer contour — 9 points, clockwise, viewBox 0 0 100 120 */
const PATH = 'M 32,4 L 68,2 L 88,22 L 90,52 L 72,88 L 48,96 L 28,90 L 4,62 L 6,32 Z'

/* Facet diagonals */
const LINES: [string, string][] = [
  ['32,4',  '90,52'],
  ['68,2',  '4,62'],
  ['88,22', '28,90'],
  ['6,32',  '72,88'],
  ['32,4',  '48,96'],
  ['4,62',  '90,52'],
]

const DEFAULT_SIZE: Record<string, number> = {
  header:    28,
  sidebar:   22,
  watermark: 260,
  ghost:     100,
  hero:      280,
}

const DEFAULT_STROKE: Record<string, number> = {
  header:    1.5,
  sidebar:   1.5,
  watermark: 0.6,
  ghost:     1,
  hero:      1,
}

export default function GeometricMotif({
  variant = 'header',
  size,
  color,
  opacity = 1,
  className,
  style,
}: GeometricMotifProps) {
  const sz          = size ?? DEFAULT_SIZE[variant] ?? 28
  const strokeWidth = DEFAULT_STROKE[variant] ?? 1.5
  const stroke      = color ?? 'currentColor'

  return (
    <svg
      viewBox="0 0 100 120"
      width={sz}
      height={sz * 1.2}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, ...style }}
    >
      <path
        d={PATH}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {LINES.map(([a, b], i) => {
        const [x1, y1] = a.split(',')
        const [x2, y2] = b.split(',')
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
