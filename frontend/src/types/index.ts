export interface Domain {
  id: number
  code: string
  name_ru: string
  color: string
  icon: string
  sort_order: number
}

export interface Department {
  id: number
  code: string
  name_short: string
  name_full: string
  head_name: string | null
  head_email: string | null
  staff_count: number
  indicator_count?: number
}

export interface Indicator {
  id: number
  dept_id: number
  domain_id: number
  domain_code: string
  domain_name: string
  domain_color: string
  code: string
  name: string
  unit: string
  target: number
  warning_thr: number
  critical_thr: number
  weight: number
  description: string | null
  // from kpi query
  actual?: number | null
  plan?: number | null
  period_year?: number
  period_month?: number
  status?: 'green' | 'yellow' | 'red' | 'no_data'
}

export interface KpiValue {
  id: number
  indicator_id: number
  period_year: number
  period_month: number
  actual: number | null
  plan: number | null
  comment: string | null
}

export interface KpiResponse {
  dept_id: number
  year: number
  month: number
  indicators: Indicator[]
}

export interface MasterCell {
  score: number | null
  avg_pct: number | null
}

export interface MasterDept extends Department {
  overall_score: number | null
  domains: Record<string, MasterCell>
}

export interface MasterResponse {
  year: number
  month: number
  domains: Domain[]
  departments: MasterDept[]
}

export interface KaizenItem {
  id: number
  dept_id: number
  dept_name: string
  domain_name: string | null
  title: string
  description: string | null
  author_name: string | null
  status: 'new' | 'in_progress' | 'done' | 'rejected'
  impact_score: number | null
  created_at: string
}

export type UserRole = 'admin' | 'dept_head' | 'management' | 'public'

export interface AuthUser {
  sub: number
  email: string
  name: string
  role: UserRole
  dept_id: number | null
}
