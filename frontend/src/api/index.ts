import api from './client'
import type {
  Department, KpiResponse, MasterResponse, KaizenItem,
  AlertsResponse, TrendPoint, UserRecord, AuditResponse, IndicatorFull,
} from '@/types'

export const getDepartments = () =>
  api.get<Department[]>('/departments').then(r => r.data)

export const getDepartment = (id: number | string) =>
  api.get<Department & { indicators: any[] }>(`/departments/${id}`).then(r => r.data)

export const getKpi = (deptId: number | string, year?: number, month?: number) =>
  api.get<KpiResponse>(`/kpi/${deptId}`, { params: { year, month } }).then(r => r.data)

export const getKpiIndicator = (deptId: number | string, indicatorId: number | string) =>
  api.get(`/kpi/${deptId}/${indicatorId}`).then(r => r.data)

export const getMaster = (year?: number, month?: number) =>
  api.get<MasterResponse>('/master', { params: { year, month } }).then(r => r.data)

export const getAlerts = (year?: number, month?: number) =>
  api.get<AlertsResponse>('/alerts', { params: { year, month } }).then(r => r.data)

export const getTrends = (deptId: number | string, months = 6) =>
  api.get<{ dept_id: number; points: TrendPoint[] }>(`/trends/${deptId}`, { params: { months } }).then(r => r.data)

export const getCompanyTrends = (months = 12) =>
  api.get<{ points: TrendPoint[] }>('/trends/company/summary', { params: { months } }).then(r => r.data)

export const getKaizen = (params?: { dept_id?: number; status?: string }) =>
  api.get<KaizenItem[]>('/kaizen', { params }).then(r => r.data)

// Users
export const getUsers = () =>
  api.get<UserRecord[]>('/users').then(r => r.data)

export const createUser = (data: Partial<UserRecord> & { password: string }) =>
  api.post<{ id: number }>('/users', data).then(r => r.data)

export const patchUser = (id: number, data: Partial<UserRecord>) =>
  api.patch(`/users/${id}`, data).then(r => r.data)

export const deleteUser = (id: number) =>
  api.delete(`/users/${id}`).then(r => r.data)

export const resetPassword = (id: number, newPassword: string) =>
  api.post(`/users/${id}/reset-password`, { newPassword }).then(r => r.data)

// Indicators
export const getIndicators = (deptId?: number | string) =>
  api.get<IndicatorFull[]>('/indicators', { params: deptId ? { dept_id: deptId } : {} }).then(r => r.data)

export const patchIndicator = (id: number, data: Partial<IndicatorFull>) =>
  api.patch(`/indicators/${id}`, data).then(r => r.data)

// Audit
export const getAudit = (params?: {
  entity?: string; entity_id?: number; user_id?: number; action?: string; limit?: number; offset?: number
}) => api.get<AuditResponse>('/audit', { params }).then(r => r.data)

// Presentations
export interface Presentation {
  id: number
  author_name: string
  topic: string
  deadline: string | null
  status: 'planned' | 'in_progress' | 'done'
  sort_order: number
  created_at: string
  updated_at: string
}

export const getPresentations = () =>
  api.get<Presentation[]>('/presentations').then(r => r.data)

export const createPresentation = (data: Omit<Presentation, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<{ id: number }>('/presentations', data).then(r => r.data)

export const updatePresentation = (id: number, data: Partial<Omit<Presentation, 'id' | 'created_at' | 'updated_at'>>) =>
  api.put(`/presentations/${id}`, data).then(r => r.data)

export const deletePresentation = (id: number) =>
  api.delete(`/presentations/${id}`).then(r => r.data)

// Auth
export const login = (email: string, password: string) =>
  api.post<{ accessToken: string; refreshToken: string; role: string; name: string }>(
    '/auth/login', { email, password }
  ).then(r => r.data)

export const refreshToken = (token: string) =>
  api.post<{ accessToken: string }>('/auth/refresh', { refreshToken: token }).then(r => r.data)

export const logout = (token: string) =>
  api.post('/auth/logout', { refreshToken: token })
