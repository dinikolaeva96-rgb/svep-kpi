import clsx from 'clsx'

type Trend = 'up' | 'down' | 'stable'

interface Props {
  trend: Trend
  className?: string
}

const meta: Record<Trend, { icon: string; cls: string; label: string }> = {
  up:     { icon: '↑', cls: 'text-green-400', label: 'Рост' },
  down:   { icon: '↓', cls: 'text-red-400',   label: 'Снижение' },
  stable: { icon: '→', cls: 'text-gray-500',  label: 'Стабильно' },
}

export default function TrendBadge({ trend, className }: Props) {
  const { icon, cls, label } = meta[trend]
  return (
    <span className={clsx('inline-flex items-center gap-0.5 text-xs font-bold', cls, className)} title={label}>
      {icon}
    </span>
  )
}
