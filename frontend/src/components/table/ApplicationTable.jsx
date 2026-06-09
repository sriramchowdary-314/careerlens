import React, { useState } from 'react'
import { STATUS_CONFIG } from '../kanban/KanbanColumn'

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SAVED
  return (
    <span className={`badge ${config.badgeClass}`}>
      {config.label}
    </span>
  )
}

function formatSalary(min, max) {
  if (!min && !max) return '—'
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  return `Up to ${fmt(max)}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function SortIcon({ active, direction }) {
  if (!active) {
    return (
      <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
  }
  return direction === 'asc' ? (
    <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function ApplicationTable({
  applications,
  loading,
  error,
  pagination,
  filters,
  onEdit,
  onDelete,
  onFilterChange
}) {
  const [deletingId, setDeletingId] = useState(null)

  const handleSort = (column) => {
    if (filters.sortBy === column) {
      onFilterChange({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      onFilterChange({ sortBy: column, sortDir: 'asc' })
    }
  }

  const handleDelete = async (app) => {
    const confirmed = window.confirm(
      `Delete application for "${app.role}" at "${app.company}"? This cannot be undone.`
    )
    if (!confirmed) return
    setDeletingId(app.id)
    try {
      await onDelete(app.id)
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'company', label: 'Company', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'location', label: 'Location', sortable: false },
    { key: 'salary', label: 'Salary', sortable: false },
    { key: 'appliedDate', label: 'Applied', sortable: true },
    { key: 'followUpDate', label: 'Follow-up', sortable: false },
    { key: 'actions', label: '', sortable: false }
  ]

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500',
                    col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''
                  ].join(' ')}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon
                        active={filters.sortBy === col.key}
                        direction={filters.sortDir}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="spinner h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading applications…
                  </div>
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  No applications found. Add your first one!
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                const isOverdue = app.overdueFollowUp
                return (
                  <tr
                    key={app.id}
                    className={[
                      'transition-colors hover:bg-gray-50',
                      isOverdue ? 'bg-amber-50 hover:bg-amber-100' : ''
                    ].join(' ')}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{app.company}</span>
                        {isOverdue && (
                          <span className="badge bg-red-100 text-red-700 text-xs">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{app.role}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{app.location || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatSalary(app.salaryMin, app.salaryMax)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(app.appliedDate)}
                    </td>
                    <td className={[
                      'px-4 py-3 text-sm whitespace-nowrap',
                      isOverdue ? 'font-medium text-red-600' : 'text-gray-500'
                    ].join(' ')}>
                      {formatDate(app.followUpDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(app)}
                          className="rounded p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          title="Edit application"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(app)}
                          disabled={deletingId === app.id}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete application"
                        >
                          {deletingId === app.id ? (
                            <svg className="spinner h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium">
              {pagination.page * pagination.size + 1}
            </span>{' '}
            –{' '}
            <span className="font-medium">
              {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{pagination.totalElements}</span> applications
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFilterChange({ page: pagination.page - 1 })}
              disabled={pagination.page === 0 || loading}
              className="btn-secondary py-1 px-2 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onFilterChange({ page: pagination.page + 1 })}
              disabled={pagination.last || loading}
              className="btn-secondary py-1 px-2 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
