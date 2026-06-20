import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: d  => api.post('/auth/register', d),
  login:    d  => api.post('/auth/login', d),
  me:       () => api.get('/auth/me'),
  update:   d  => api.put('/auth/me', d),
}

export const resumeAPI = {
  upload:     fd => api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getActive:  () => api.get('/resume/active'),
  getHistory: () => api.get('/resume/history'),
}

export const twinAPI = {
  generate:     () => api.post('/twin/generate'),
  getMe:        () => api.get('/twin/me'),
  getSnapshots: () => api.get('/twin/snapshots'),
}

export const skillsAPI = {
  getGaps: d => api.post('/skills/gaps', d),
}

export const roadmapAPI = {
  generate:   type => api.post(`/roadmap/generate/${type}`),
  getHistory: ()   => api.get('/roadmap/history'),
}

export const simulationAPI = {
  run:        d => api.post('/simulation/run', d),
  getHistory: () => api.get('/simulation/history'),
}

export const companyAPI = {
  match: d => api.post('/company/match', d),
}

export const interviewAPI = {
  log:        d => api.post('/interview/log', d),
  getHistory: () => api.get('/interview/history'),
}

export default api
