import { useState, useCallback, useEffect, useRef } from 'react'
import { applicationsApi } from '../services/api'

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
  page: 0,
  size: 20
}

export function useApplications(autoFetch = true) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true
  })
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  // Ref to avoid stale closures in abort logic
  const abortControllerRef = useRef(null)

  const fetchApplications = useCallback(async (overrideParams = {}) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    const params = { ...filters, ...overrideParams }

    try {
      const response = await applicationsApi.getAll(params)
      const data = response.data
      setApplications(data.content || [])
      setPagination({
        page: data.page ?? 0,
        size: data.size ?? 20,
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
        last: data.last ?? true
      })
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setError(err.response?.data?.message || 'Failed to load applications')
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Auto-fetch when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchApplications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, autoFetch])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 0 whenever non-page filters change
      page: newFilters.page !== undefined ? newFilters.page : 0
    }))
  }, [])

  const createApplication = useCallback(async (data) => {
    const response = await applicationsApi.create(data)
    const created = response.data
    // Optimistically prepend to list if we're on first page
    setApplications((prev) => {
      if (filters.page === 0) {
        return [created, ...prev]
      }
      return prev
    })
    setPagination((prev) => ({
      ...prev,
      totalElements: prev.totalElements + 1
    }))
    return created
  }, [filters.page])

  const updateApplication = useCallback(async (id, data) => {
    const response = await applicationsApi.update(id, data)
    const updated = response.data
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? updated : app))
    )
    return updated
  }, [])

  const deleteApplication = useCallback(async (id) => {
    await applicationsApi.delete(id)
    setApplications((prev) => prev.filter((app) => app.id !== id))
    setPagination((prev) => ({
      ...prev,
      totalElements: Math.max(0, prev.totalElements - 1)
    }))
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    const response = await applicationsApi.updateStatus(id, status)
    const updated = response.data
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? updated : app))
    )
    return updated
  }, [])

  const refresh = useCallback(() => {
    fetchApplications()
  }, [fetchApplications])

  return {
    // State
    applications,
    loading,
    error,
    pagination,
    filters,
    // Actions
    fetchApplications,
    updateFilters,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus,
    refresh
  }
}
