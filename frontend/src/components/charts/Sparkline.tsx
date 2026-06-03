import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  data: Array<{ value: number | null }>
  color?: string
  height?: number
}

export default function Sparkline({ data, color = '#60A5FA', height = 40 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }}
          formatter={(v: any) => [v ?? '—', '']}
          labelFormatter={() => ''}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
