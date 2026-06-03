import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      const refreshed = await useAuthStore.getState().refresh()
      if (refreshed) {
        err.config.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`
        return api(err.config)
      }
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

export default api
