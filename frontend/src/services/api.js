import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bdn_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
}

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error.response) {
    return 'Cannot connect to the backend. Please start the backend server and try again.'
  }

  const detail = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.filter((part) => part !== 'body').join('.') : ''
        return field ? `${field}: ${item.msg}` : item.msg
      })
      .join('\n')
  }

  return fallback
}

export const networkApi = {
  donors: (params) => api.get('/donors', { params }),
  updateDonor: (id, payload) => api.put(`/donors/${id}`, payload),
  updateDonorMyStatus: (payload) => api.put(`/donors/me/status`, payload),
  requests: () => api.get('/requests'),
  createRequest: (payload) => api.post('/requests', payload),
  updateRequest: (id, payload) => api.put(`/requests/${id}`, payload),
  hospitals: () => api.get('/hospitals'),
  users: () => api.get('/users'),
  notifications: () => api.get('/users/notifications'),
  analytics: () => api.get('/analytics'),
  rankDonors: (payload) => api.post('/ai/rank-donor', payload),
  updateLiveLocation: (payload) => api.put('/locations/update', payload),
  updateDonorVerification: (id, payload) => api.put(`/donors/${id}/verification`, payload),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  chatAI: (payload) => api.post('/ai/chat', payload),
  predictDemand: () => api.get('/ai/predictive-demand'),
}
