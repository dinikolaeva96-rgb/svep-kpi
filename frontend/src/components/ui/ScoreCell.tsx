import clsx from 'clsx'

function scoreToColor(score: number | null): string {
  if (score === null) return 'cell-nodata'
  if (score >= 80) return 'cell-green'
  if (score >= 60) return 'cell-yellow'
  return 'cell-red'
}

interface Props {
  score: number | null
  label?: string
  className?: string
  onClick?: () => void
}

export default function ScoreCell({ score, label, className, onClick }: Props) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center justify-center rounded text-xs font-semibold transition-transform',
        scoreToColor(score),
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
    >
      <span className="text-sm font-bold mono-num">{score !== null ? `${score}%` : '—'}</span>
      {label && <span className="text-[10px] opacity-70 mt-0.5 truncate max-w-full px-1">{label}</span>}
    </div>
  )
}
