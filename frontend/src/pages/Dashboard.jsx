import React, { useState, useCallback } from 'react'
import KanbanBoard from '../components/kanban/KanbanBoard'
import ApplicationTable from '../components/table/ApplicationTable'
import ApplicationModal from '../components/forms/ApplicationModal'
import { useApplications } from '../hooks/useApplications'

const VIEW_KANBAN = 'kanban'
const VIEW_TABLE = 'table'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'OA', label: 'Online Assessment' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' }
]

function ViewToggle({ view, onChange }) {
  return (
    <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
      <button
        onClick={() => onChange(VIEW_KANBAN)}
        className={[
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          view === VIEW_KANBAN
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        ].join(' ')}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Kanban
      </button>
      <button
        onClick={() => onChange(VIEW_TABLE)}
        className={[
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          view === VIEW_TABLE
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        ].join(' ')}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Table
      </button>
    </div>
  )
}

export default function Dashboard() {
  const [view, setView] = useState(VIEW_KANBAN)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [searchInput, setSearchInput] = useState('')

  const {
    applications,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus
  } = useApplications(true)

  // Count overdue follow-ups
  const overdueCount = applications.filter((a) => a.overdueFollowUp).length

  const handleOpenCreate = () => {
    setEditingApp(null)
    setModalOpen(true)
  }

  const handleOpenEdit = useCallback((app) => {
    setEditingApp(app)
    setModalOpen(true)
  }, [])

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingApp(null)
  }

  const handleModalSubmit = async (data) => {
    if (editingApp) {
      await updateApplication(editingApp.id, data)
    } else {
      await createApplication(data)
    }
  }

  const handleStatusChange = useCallback(async (id, newStatus) => {
    await updateStatus(id, newStatus)
  }, [updateStatus])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      updateFilters({ search: searchInput })
    }
  }

  const handleSearchClear = () => {
    setSearchInput('')
    updateFilters({ search: '' })
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pagination.totalElements} application{pagination.totalElements !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <button onClick={handleOpenCreate} className="btn-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Application
          </button>
        </div>
      </div>

      {/* Overdue follow-ups banner */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-amber-800">
            You have{' '}
            <span className="font-bold">{overdueCount}</span>{' '}
            overdue follow-up{overdueCount !== 1 ? 's' : ''}.{' '}
            <span className="font-normal text-amber-700">Review and follow up to stay on top of your search.</span>
          </p>
        </div>
      )}

      {/* Filters bar (only shown in table view) */}
      {view === VIEW_TABLE && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search company or role… (Enter)"
              className="input-field pl-9 pr-8"
            />
            {searchInput && (
              <button
                onClick={handleSearchClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="input-field w-auto"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Sort by */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="input-field w-auto"
          >
            <option value="createdAt">Sort: Date Added</option>
            <option value="appliedDate">Sort: Applied Date</option>
            <option value="company">Sort: Company</option>
            <option value="role">Sort: Role</option>
          </select>

          {/* Sort dir */}
          <button
            onClick={() => updateFilters({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
            className="btn-secondary px-3"
            title={filters.sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
          >
            {filters.sortDir === 'asc' ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main content */}
      {view === VIEW_KANBAN ? (
        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {loading && applications.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">
              <svg className="spinner mr-2 h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading applications…
            </div>
          ) : (
            <KanbanBoard
              applications={applications}
              onCardClick={handleOpenEdit}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      ) : (
        <ApplicationTable
          applications={applications}
          loading={loading}
          error={null}
          pagination={pagination}
          filters={filters}
          onEdit={handleOpenEdit}
          onDelete={deleteApplication}
          onFilterChange={updateFilters}
        />
      )}

      {/* Application Modal */}
      <ApplicationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialData={editingApp}
      />
    </div>
  )
}
