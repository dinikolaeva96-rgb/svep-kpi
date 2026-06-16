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
        className="input-light"
      >
        {years.map(y => <option key={y}>{y}</option>)}
      </select>
      <select
        value={month}
        onChange={e => onMonth(+e.target.value)}
        className="input-light"
      >
        {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
      </select>
    </div>
  )
}
