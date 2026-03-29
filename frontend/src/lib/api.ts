import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.msg || error.message || '请求失败'
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
  }
}

export const authApi = {
  login: (data: LoginParams) => api.post<{ code: number; msg: string; data: AuthResponse }>('/auth/login', data),
  register: (data: RegisterParams) => api.post<{ code: number; msg: string; data: AuthResponse }>('/auth/register', data),
  me: () => api.get<{ code: number; msg: string; data: AuthResponse['user'] }>('/auth/me'),
}

export interface Chart {
  id: string
  title: string
  type: string
  content: string
  isPublic: boolean
  userId: number
  createdAt: string
  updatedAt: string
}

export interface ChartListResponse {
  list: Chart[]
  total: number
  page: number
}

export interface GenerateResponse {
  mermaid: string
  type: string
}

export const chartApi = {
  generate: (prompt: string, type?: string) =>
    api.post<{ code: number; msg: string; data: GenerateResponse }>('/chart/generate', { prompt, type }),

  list: (page = 1, pageSize = 10) =>
    api.get<{ code: number; msg: string; data: ChartListResponse }>('/charts', {
      params: { page, pageSize },
    }),

  get: (id: string) => api.get<{ code: number; msg: string; data: Chart }>(`/charts/${id}`),

  create: (data: { title: string; type: string; content: string; isPublic: boolean }) =>
    api.post<{ code: number; msg: string; data: Chart }>('/charts', data),

  update: (id: string, data: Partial<{ title: string; type: string; content: string; isPublic: boolean }>) =>
    api.put<{ code: number; msg: string; data: Chart }>(`/charts/${id}`, data),

  delete: (id: string) => api.delete<{ code: number; msg: string }>(`/charts/${id}`),

  getPublic: (id: string) => api.get<{ code: number; msg: string; data: Chart }>(`/charts/public/${id}`),
}

export default api