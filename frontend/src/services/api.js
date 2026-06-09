import axios from 'axios'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'jobtrackr_access_token',
  REFRESH_TOKEN: 'jobtrackr_refresh_token',
  USER: 'jobtrackr_user'
}

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// Track whether we are already refreshing to avoid infinite loops
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh on 401, and only once
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

      if (!storedRefreshToken) {
        isRefreshing = false
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post('/api/auth/refresh', {
          refreshToken: storedRefreshToken
        })

        const { accessToken, refreshToken, user } = response.data

        // Persist the new tokens
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        if (user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        }

        // Update Authorization header for the default client
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function clearAuthAndRedirect() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  // Use window.location to trigger a full navigation (React Router not available here)
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  login: (credentials) =>
    apiClient.post('/auth/login', credentials),

  register: (data) =>
    apiClient.post('/auth/register', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken })
}

// ─── Applications API ────────────────────────────────────────────────────────

export const applicationsApi = {
  /**
   * Get paginated list of applications.
   * @param {object} params - { page, size, status, search, sortBy, sortDir }
   */
  getAll: (params = {}) => {
    const {
      page = 0,
      size = 20,
      status = '',
      search = '',
      sortBy = 'createdAt',
      sortDir = 'desc'
    } = params
    return apiClient.get('/applications', {
      params: { page, size, status, search, sortBy, sortDir }
    })
  },

  /**
   * Get a single application by ID.
   */
  getById: (id) =>
    apiClient.get(`/applications/${id}`),

  /**
   * Create a new application.
   * @param {object} data - JobApplicationRequest
   */
  create: (data) =>
    apiClient.post('/applications', data),

  /**
   * Update an existing application.
   * @param {string|number} id
   * @param {object} data - JobApplicationRequest
   */
  update: (id, data) =>
    apiClient.put(`/applications/${id}`, data),

  /**
   * Delete an application.
   * @param {string|number} id
   */
  delete: (id) =>
    apiClient.delete(`/applications/${id}`),

  /**
   * Patch only the status of an application.
   * @param {string|number} id
   * @param {string} status - ApplicationStatus enum value
   */
  updateStatus: (id, status) =>
    apiClient.patch(`/applications/${id}/status`, { status }),

  /**
   * Get analytics data.
   */
  getAnalytics: () =>
    apiClient.get('/applications/analytics')
}

export default apiClient
