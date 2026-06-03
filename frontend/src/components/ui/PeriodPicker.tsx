const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

interface Props {
  year: number
  month: number
  onYear: (y: number) => void
  onMonth: (m: number) => void
  years?: number[]
}

export default function PeriodPicker({ year, month, onYear, onMonth, years = [2025, 2026] }: Props) {
  return (
    <div className="flex gap-2">
      <select
        value={year}
        onChange={e => onYear(+e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
      >
        {years.map(y => <option key={y}>{y}</option>)}
      </select>
      <select
        value={month}
        onChange={e => onMonth(+e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
      >
        {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
      </select>
    </div>
  )
}
