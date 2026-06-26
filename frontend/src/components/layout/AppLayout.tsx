import { useState, useEffect, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { getAlerts } from '@/api'

export default function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === '1' } catch { return false }
  })
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    getAlerts().then(r => setAlertCount(r.summary.red + r.summary.yellow)).catch(() => {})
  }, [])

  function toggle() {
    setCollapsed(c => {
      const next = !c
      try { localStorage.setItem('sidebar-collapsed', next ? '1' : '0') } catch {}
      return next
    })
  }

  const sideW = collapsed ? 64 : 240

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EEF4FA' }}>
      <Sidebar collapsed={collapsed} onToggle={toggle} alertCount={alertCount} />
      <div style={{
        marginLeft: sideW,
        flex: 1,
        transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Topbar collapsed={collapsed} />
        <main style={{ marginTop: 52, flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
