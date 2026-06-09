import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'jobtrackr_access_token',
  REFRESH_TOKEN: 'jobtrackr_refresh_token',
  USER: 'jobtrackr_user'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER)

      if (storedAccessToken && storedRefreshToken && storedUser) {
        setAccessToken(storedAccessToken)
        setRefreshToken(storedRefreshToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (err) {
      // Corrupted storage — clear it
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    } finally {
      setLoading(false)
    }
  }, [])

  const persistAuth = useCallback((authResponse) => {
    const { accessToken: at, refreshToken: rt, user: u } = authResponse
    setAccessToken(at)
    setRefreshToken(rt)
    setUser(u)
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, at)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, rt)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u))
  }, [])

  const clearAuth = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    persistAuth(response.data)
    return response.data
  }, [persistAuth])

  const register = useCallback(async (data) => {
    const response = await authApi.register(data)
    persistAuth(response.data)
    return response.data
  }, [persistAuth])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (_err) {
      // Ignore logout errors — clear local state regardless
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: !!accessToken && !!user,
    login,
    register,
    logout,
    persistAuth,
    clearAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
