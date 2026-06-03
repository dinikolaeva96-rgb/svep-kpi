import clsx from 'clsx'

type Status = 'green' | 'yellow' | 'red' | 'no_data'

const map: Record<Status, { cls: string; label: string }> = {
  green:   { cls: 'status-green',  label: '✓' },
  yellow:  { cls: 'status-yellow', label: '!' },
  red:     { cls: 'status-red',    label: '✗' },
  no_data: { cls: 'status-nodata', label: '—' },
}

export default function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { cls, label } = map[status] ?? map.no_data
  return (
    <span className={clsx('inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold', cls, className)}>
      {label}
    </span>
  )
}
