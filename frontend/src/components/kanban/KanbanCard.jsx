import React from 'react'
import { Draggable } from '@hello-pangea/dnd'

function formatSalary(min, max) {
  if (!min && !max) return null
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
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function KanbanCard({ application, index, onClick }) {
  const {
    id,
    company,
    role,
    location,
    salaryMin,
    salaryMax,
    appliedDate,
    overdueFollowUp
  } = application

  const salaryLabel = formatSalary(salaryMin, salaryMax)
  const appliedLabel = formatDate(appliedDate)

  return (
    <Draggable draggableId={String(id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(application)}
          className={[
            'group relative cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow',
            snapshot.isDragging
              ? 'shadow-lg ring-2 ring-primary-400'
              : 'border-gray-200 hover:shadow-md hover:border-gray-300'
          ].join(' ')}
        >
          {/* Overdue indicator */}
          {overdueFollowUp && (
            <span
              className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-red-500"
              title="Follow-up overdue"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            </span>
          )}

          {/* Company */}
          <p className="pr-4 text-sm font-semibold leading-snug text-gray-900 group-hover:text-primary-700">
            {company}
          </p>

          {/* Role */}
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{role}</p>

          {/* Location */}
          {location && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Salary */}
          {salaryLabel && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{salaryLabel}</span>
            </div>
          )}

          {/* Applied date */}
          {appliedLabel && (
            <div className="mt-2 text-xs text-gray-300">
              Applied {appliedLabel}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
