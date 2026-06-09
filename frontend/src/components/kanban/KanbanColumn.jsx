import React from 'react'
import { Droppable } from '@hello-pangea/dnd'
import KanbanCard from './KanbanCard'

export const STATUS_CONFIG = {
  SAVED: {
    label: 'Saved',
    badgeClass: 'bg-gray-100 text-gray-700',
    headerClass: 'border-gray-300',
    dotClass: 'bg-gray-400'
  },
  APPLIED: {
    label: 'Applied',
    badgeClass: 'bg-blue-100 text-blue-700',
    headerClass: 'border-blue-400',
    dotClass: 'bg-blue-500'
  },
  OA: {
    label: 'Online Assessment',
    badgeClass: 'bg-amber-100 text-amber-700',
    headerClass: 'border-amber-400',
    dotClass: 'bg-amber-500'
  },
  INTERVIEW: {
    label: 'Interview',
    badgeClass: 'bg-purple-100 text-purple-700',
    headerClass: 'border-purple-400',
    dotClass: 'bg-purple-500'
  },
  OFFER: {
    label: 'Offer',
    badgeClass: 'bg-green-100 text-green-700',
    headerClass: 'border-green-400',
    dotClass: 'bg-green-500'
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700',
    headerClass: 'border-red-400',
    dotClass: 'bg-red-500'
  }
}

export default function KanbanColumn({ status, applications, onCardClick }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SAVED

  return (
    <div className={`flex w-72 shrink-0 flex-col rounded-xl border-t-4 bg-gray-50 ring-1 ring-gray-200 ${config.headerClass}`}>
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} />
          <span className="text-sm font-semibold text-gray-700">{config.label}</span>
        </div>
        <span className={`badge ${config.badgeClass}`}>
          {applications.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              'flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 transition-colors',
              'min-h-[120px] max-h-[calc(100vh-220px)]',
              snapshot.isDraggingOver ? 'bg-primary-50' : ''
            ].join(' ')}
          >
            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8">
                <p className="text-xs text-gray-400">Drop cards here</p>
              </div>
            )}

            {applications.map((app, index) => (
              <KanbanCard
                key={app.id}
                application={app}
                index={index}
                onClick={onCardClick}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
