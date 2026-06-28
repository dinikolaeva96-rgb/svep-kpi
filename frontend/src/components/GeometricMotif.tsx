import type { CSSProperties } from 'react'

interface GeometricMotifProps {
  variant?: 'header' | 'watermark' | 'ghost' | 'hero' | 'sidebar'
  size?: number
  color?: string
  opacity?: number
  className?: string
  style?: CSSProperties
}

/* Crystal outer contour — 10 points, asymmetric diamond, viewBox 0 0 100 120 */
const PATH = 'M 30,3 L 65,0 L 85,18 L 88,48 L 75,82 L 52,98 L 28,95 L 5,68 L 3,35 L 18,10 Z'

/* Facet diagonals */
const LINES: [string, string][] = [
  ['30,3',  '88,48'],
  ['65,0',  '5,68'],
  ['85,18', '28,95'],
  ['18,10', '75,82'],
  ['30,3',  '52,98'],
  ['3,35',  '88,48'],
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
