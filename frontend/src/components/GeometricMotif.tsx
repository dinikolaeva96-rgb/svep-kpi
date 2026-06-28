import type { CSSProperties } from 'react'

interface GeometricMotifProps {
  variant?: 'header' | 'sidebar' | 'hero' | 'watermark' | 'ghost'
  size?: number
  color?: string
  opacity?: number
  className?: string
  style?: CSSProperties
}

/* 18 facets from original AI source — outer facets (1-indexed) use thicker stroke */
const OUTER_FACETS = new Set([1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14])

const FACETS = [
  "73.9,44.9 65.9,28.8 91.5,9.4",          // 1  outer
  "91.5,90.6 65.9,71.2 73.9,55.1",          // 2  outer
  "58.5,86.0 63.9,75.1 88.1,93.4",          // 3  outer
  "49.8,93.4 45.5,86.9 52.2,88.6",          // 4  outer
  "20.3,80.6 39.0,85.3 43.7,92.4",          // 5  outer
  "23.0,61.2 35.6,80.2 7.3,73.1",           // 6  outer
  "4.7,33.5 15.6,50.0 4.8,66.4",            // 7  outer
  "20.6,57.6 11.4,64.6 18.3,54.1",          // 8  inner
  "18.3,46.0 11.3,35.4 20.7,42.5",          // 9  inner
  "35.7,19.7 23.0,38.8 7.1,26.8",           // 10 outer
  "43.7,7.6 39.1,14.6 20.3,19.3",           // 11 outer
  "49.8,6.6 52.1,11.3 45.5,13.0",           // 12 outer
  "81.0,4.1 56.6,10.2 53.6,4.1",            // 13 outer
  "58.5,14.0 88.2,6.5 63.9,24.9",           // 14 outer
  "37.8,50.0 62.2,31.6 71.3,50.0 62.2,68.4",                    // 15 inner
  "34.2,52.7 60.2,72.4 54.0,84.8 42.1,81.8 26.6,58.5",          // 16 inner
  "26.6,41.6 42.2,18.1 54.0,15.1 60.2,27.6 34.2,47.3",          // 17 inner
  "30.7,50.0 24.2,54.9 21.0,50.0 24.2,45.2",                    // 18 inner
]

const CONFIGS: Record<string, { size: number; outerStroke: number; innerStroke: number }> = {
  header:    { size: 28,  outerStroke: 1.5, innerStroke: 0.8 },
  sidebar:   { size: 24,  outerStroke: 1.5, innerStroke: 0.8 },
  hero:      { size: 280, outerStroke: 1.2, innerStroke: 0.65 },
  watermark: { size: 320, outerStroke: 0.6, innerStroke: 0.35 },
  ghost:     { size: 120, outerStroke: 0.8, innerStroke: 0.45 },
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
      {FACETS.map((pts, i) => {
        const isOuter = OUTER_FACETS.has(i + 1)
        return (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth={isOuter ? cfg.outerStroke : cfg.innerStroke}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={isOuter ? 1 : 0.75}
          />
        )
      })}
    </svg>
  )
}
