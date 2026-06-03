import clsx from 'clsx'

interface Props {
  className?: string
  lines?: number
}

export default function Skeleton({ className, lines = 1 }: Props) {
  return (
    <div className={clsx('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-800 rounded" style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }} />
      ))}
    </div>
  )
}
