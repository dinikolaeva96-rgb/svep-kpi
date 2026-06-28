import type { CSSProperties } from 'react'

interface GeometricMotifProps {
  variant?: 'header' | 'sidebar' | 'hero' | 'watermark' | 'ghost'
  size?: number
  color?: string
  opacity?: number
  className?: string
  style?: CSSProperties
}

/* 18 triangular/poly facets extracted from original AI source */
const FACETS = [
  "73.9,44.9 65.9,28.8 91.5,9.4",
  "91.5,90.6 65.9,71.2 73.9,55.1",
  "58.5,86.0 63.9,75.1 88.1,93.4",
  "49.8,93.4 45.5,86.9 52.2,88.6",
  "20.3,80.6 39.0,85.3 43.7,92.4",
  "23.0,61.2 35.6,80.2 7.3,73.1",
  "4.7,33.5 15.6,50.0 4.8,66.4",
  "20.6,57.6 11.4,64.6 18.3,54.1",
  "18.3,46.0 11.3,35.4 20.7,42.5",
  "35.7,19.7 23.0,38.8 7.1,26.8",
  "43.7,7.6 39.1,14.6 20.3,19.3",
  "49.8,6.6 52.1,11.3 45.5,13.0",
  "81.0,4.1 56.6,10.2 53.6,4.1",
  "58.5,14.0 88.2,6.5 63.9,24.9",
  "37.8,50.0 62.2,31.6 71.3,50.0 62.2,68.4",
  "34.2,52.7 60.2,72.4 54.0,84.8 42.1,81.8 26.6,58.5",
  "26.6,41.6 42.2,18.1 54.0,15.1 60.2,27.6 34.2,47.3",
  "30.7,50.0 24.2,54.9 21.0,50.0 24.2,45.2",
]

const OUTER = "49,0.3 97.7,0 99.8,2.9 76.4,50 99.8,97.1 97.7,100 49,99.7 1.3,75.8 0.1,25.3 1.2,24.1"

const CONFIGS: Record<string, { size: number; strokeW: number; facetOpacity: number }> = {
  header:    { size: 28,  strokeW: 1.5, facetOpacity: 0.7 },
  sidebar:   { size: 24,  strokeW: 1.5, facetOpacity: 0.65 },
  hero:      { size: 280, strokeW: 1.2, facetOpacity: 0.7 },
  watermark: { size: 320, strokeW: 0.6, facetOpacity: 0.6 },
  ghost:     { size: 120, strokeW: 0.8, facetOpacity: 0.6 },
}

export default function GeometricMotif({
  variant = 'header',
  size,
  color = '#1C84C6',
  opacity = 1,
  className,
  style,
}: GeometricMotifProps) {
  const cfg = CONFIGS[variant] ?? CONFIGS.header
  const sz = size ?? cfg.size

  return (
    <svg
      width={sz}
      height={sz}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, ...style }}
    >
      <polygon
        points={OUTER}
        fill="none"
        stroke={color}
        strokeWidth={cfg.strokeW}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {FACETS.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={cfg.strokeW * 0.75}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={cfg.facetOpacity}
        />
      ))}
    </svg>
  )
}
