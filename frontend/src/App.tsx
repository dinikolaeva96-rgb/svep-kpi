import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import AppLayout    from '@/components/layout/AppLayout'
import Home         from '@/pages/Home'
import DomainPage   from '@/pages/DomainPage'
import DeptMap      from '@/pages/DeptMap'
import KpiDetail    from '@/pages/KpiDetail'
import MasterMap    from '@/pages/MasterMap'
import Dashboard    from '@/pages/Dashboard'
import Report       from '@/pages/Report'
import Login        from '@/pages/Login'
import KaizenPage   from '@/pages/KaizenPage'
import AlertsPage   from '@/pages/AlertsPage'
import ProfilePage  from '@/pages/ProfilePage'
import AdminPage    from '@/pages/AdminPage'

function AppRoutes() {
  const { pathname } = useLocation()
  const noLayout = pathname === '/login'

  const routes = (
    <Routes>
      <Route path="/"                        element={<Home />} />
      <Route path="/domain/:id"              element={<DomainPage />} />
      <Route path="/dept/:id"                element={<DeptMap />} />
      <Route path="/dept/:id/kpi/:kpi"       element={<KpiDetail />} />
      <Route path="/master"                  element={<MasterMap />} />
      <Route path="/dashboard"               element={<Dashboard />} />
      <Route path="/report"                  element={<Report />} />
      <Route path="/kaizen"                  element={<KaizenPage />} />
      <Route path="/alerts"                  element={<AlertsPage />} />
      <Route path="/profile"                 element={<ProfilePage />} />
      <Route path="/admin"                   element={<AdminPage />} />
      <Route path="/login"                   element={<Login />} />
    </Routes>
  )

  if (noLayout) return routes
  return <AppLayout>{routes}</AppLayout>
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
