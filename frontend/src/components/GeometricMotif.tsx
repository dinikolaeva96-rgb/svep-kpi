import React from 'react'

interface GeometricMotifProps {
  variant?: 'header' | 'sidebar' | 'hero' | 'watermark' | 'ghost'
  size?: number
  color?: string
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

export default function GeometricMotif({
  variant = 'header',
  size,
  color = '#1C84C6',
  opacity,
  className = '',
  style = {},
}: GeometricMotifProps) {
  const defaults: Record<string, { size: number; sw: number; op: number }> = {
    header:    { size: 28,  sw: 1.5, op: 0.9 },
    sidebar:   { size: 24,  sw: 1.5, op: 0.85 },
    hero:      { size: 280, sw: 1.1, op: 0.9 },
    watermark: { size: 320, sw: 0.5, op: 0.05 },
    ghost:     { size: 120, sw: 0.7, op: 0.06 },
  }
  const cfg = defaults[variant] ?? defaults.header
  const sz = size ?? cfg.size
  const op = opacity ?? cfg.op
  const sw = cfg.sw

  return (
    <svg
      width={sz}
      height={sz}
      viewBox="0 0 100 100"
      fill="none"
      color={color}
      className={className}
      style={{ opacity: op, ...style }}
    >
      <polygon points="73.86,44.89 65.87,28.77 91.48,9.42" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="91.48,9.42 73.86,44.89 65.87,71.23" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="65.87,71.23 73.86,55.11 91.48,90.55" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="58.54,85.98 63.93,75.15 88.13,93.42" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="88.13,93.42 58.54,85.98 56.68,89.75" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="56.68,89.75 81.12,95.89 53.61,95.89" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="49.77,93.42 45.47,86.94 52.17,88.61" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="52.17,88.61 49.77,93.42 39.03,85.3" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="39.03,85.3 43.71,92.37 20.25,80.61" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="23.0,61.16 35.65,80.21 7.26,73.08" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="7.26,73.08 23.0,61.16 15.64,50.05" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="15.64,50.05 4.79,66.44 4.68,33.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="20.64,57.58 11.41,64.56 18.32,54.09" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="18.32,54.09 20.64,57.58 11.31,35.38" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="11.31,35.38 20.68,42.45 18.32,45.97" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="35.72,19.67 23.04,38.84 7.12,26.83" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="7.12,26.83 35.72,19.67 39.1,14.57" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="39.1,14.57 20.25,19.3 43.75,7.56" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="49.77,6.58 52.13,11.3 45.54,12.97" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="45.54,12.97 49.77,6.58 56.64,10.19" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="56.64,10.19 53.61,4.08 81.05,4.08" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="58.54,13.95 88.17,6.55 63.93,24.85" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="63.93,24.85 58.54,13.95 62.21,31.55" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="62.21,31.55 71.33,49.98 62.21,68.45" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="62.21,68.45 37.8,50.02 60.23,72.37" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="60.23,72.37 54.03,84.84 42.09,81.85" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="42.09,81.85 26.59,58.48 34.24,52.7" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="26.63,41.56 42.2,18.06 54.0,15.1" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="54.0,15.1 60.23,27.63 34.24,47.3" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="34.24,47.3 26.63,41.56 24.23,54.86" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
      <polygon points="24.23,54.86 21.03,50.05 24.23,45.17" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}
