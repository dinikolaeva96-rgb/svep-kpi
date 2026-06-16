interface GeometricMotifProps {
  variant: 'header' | 'watermark' | 'ghost'
  className?: string
}

const SIZE: Record<GeometricMotifProps['variant'], number> = {
  header: 32,
  watermark: 300,
  ghost: 140,
}

const STYLE: Record<GeometricMotifProps['variant'], { color: string; opacity: number; strokeWidth: number }> = {
  header:    { color: '#185FA5', opacity: 1,    strokeWidth: 1.4 },
  watermark: { color: '#B5D4F4', opacity: 0.45, strokeWidth: 0.5 },
  ghost:     { color: '#185FA5', opacity: 0.08, strokeWidth: 1 },
}

const POSITION: Record<GeometricMotifProps['variant'], React.CSSProperties> = {
  header: {},
  watermark: { position: 'absolute', top: 0, right: 0, pointerEvents: 'none' },
  ghost: { position: 'absolute', pointerEvents: 'none' },
}

export default function GeometricMotif({ variant, className }: GeometricMotifProps) {
  const size = SIZE[variant]
  const { color, opacity, strokeWidth } = STYLE[variant]

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, opacity, ...POSITION[variant] }}
    >
      <polygon
        points="50,4 92,32 78,88 22,88 8,32"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <line x1="50" y1="4"  x2="78" y2="88" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="50" y1="4"  x2="22" y2="88" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="8"  y1="32" x2="78" y2="88" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="92" y1="32" x2="22" y2="88" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="8"  y1="32" x2="92" y2="32" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}
