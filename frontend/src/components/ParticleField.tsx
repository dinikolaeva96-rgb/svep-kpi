import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  opacity: number
  phase: number
  shape: 'dot' | 'diamond' | 'triangle' | 'square'
  r: number; g: number; b: number
}

const COLORS = [
  [28, 132, 198],
  [91, 184, 232],
  [29, 158, 117],
  [255, 255, 255],
]

function rand(min: number, max: number) { return min + Math.random() * (max - min) }

export default function ParticleField({ count = 260, attractX = 0.6, attractY = 0.3 }: {
  count?: number; attractX?: number; attractY?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    const particles: Particle[] = []
    let raf = 0

    function resize() {
      W = canvas!.width  = canvas!.offsetWidth
      H = canvas!.height = canvas!.offsetHeight
    }

    function spawn(): Particle {
      const [r, g, b] = COLORS[Math.floor(Math.random() * COLORS.length)]
      return {
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
        size: rand(1.5, 3.5),
        opacity: rand(0.15, 0.55),
        phase: rand(0, Math.PI * 2),
        shape: (['dot', 'diamond', 'triangle', 'square'] as const)[Math.floor(Math.random() * 4)],
        r, g, b,
      }
    }

    resize()
    for (let i = 0; i < count; i++) particles.push(spawn())

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function drawShape(p: Particle, alpha: number) {
      ctx!.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`
      const s = p.size
      ctx!.beginPath()
      if (p.shape === 'dot') {
        ctx!.arc(p.x, p.y, s, 0, Math.PI * 2)
      } else if (p.shape === 'diamond') {
        ctx!.moveTo(p.x, p.y - s * 1.4)
        ctx!.lineTo(p.x + s, p.y)
        ctx!.lineTo(p.x, p.y + s * 1.4)
        ctx!.lineTo(p.x - s, p.y)
      } else if (p.shape === 'square') {
        ctx!.rect(p.x - s * 0.8, p.y - s * 0.8, s * 1.6, s * 1.6)
      } else {
        ctx!.moveTo(p.x, p.y - s * 1.5)
        ctx!.lineTo(p.x + s * 1.3, p.y + s)
        ctx!.lineTo(p.x - s * 1.3, p.y + s)
      }
      ctx!.closePath()
      ctx!.fill()
    }

    function frame() {
      ctx!.clearRect(0, 0, W, H)
      const t = Date.now() * 0.001
      const ax = W * attractX
      const ay = H * attractY

      for (const p of particles) {
        // Drift towards attractor with weak force
        const dx = ax - p.x, dy = ay - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        p.vx += (dx / dist) * 0.0012
        p.vy += (dy / dist) * 0.0012
        // Dampen
        p.vx *= 0.998; p.vy *= 0.998
        p.x += p.vx; p.y += p.vy
        // Wrap
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10

        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(t * 1.8 + p.phase))
        drawShape(p, alpha)
      }

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 80) {
            ctx!.beginPath()
            ctx!.strokeStyle = `rgba(28,132,198,${(1 - d / 80) * 0.18})`
            ctx!.lineWidth = 0.4
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [count, attractX, attractY])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
