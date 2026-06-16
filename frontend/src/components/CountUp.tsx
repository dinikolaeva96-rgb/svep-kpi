import { useEffect, useState } from 'react'

export default function CountUp({ value, suffix = '', duration = 1200, delay = 0 }: { value: number; suffix?: string; duration?: number; delay?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let raf: number
    let start: number | null = null
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (start === null) start = ts
        const progress = Math.min((ts - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(eased * value))
        if (progress < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [value, duration, delay])

  return <>{display}{suffix}</>
}
