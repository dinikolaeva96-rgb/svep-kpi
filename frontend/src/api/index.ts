import api from './client'
import type { Department, KpiResponse, MasterResponse, KaizenItem, AlertsResponse, TrendPoint } from '@/types'

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

export const login = (email: string, password: string) =>
  api.post<{ accessToken: string; refreshToken: string; role: string; name: string }>(
    '/auth/login', { email, password }
  ).then(r => r.data)

export const refreshToken = (token: string) =>
  api.post<{ accessToken: string }>('/auth/refresh', { refreshToken: token }).then(r => r.data)

export const logout = (token: string) =>
  api.post('/auth/logout', { refreshToken: token })
