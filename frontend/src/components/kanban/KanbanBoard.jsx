import React, { useMemo } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'

const ALL_STATUSES = ['SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED']

export default function KanbanBoard({ applications, onCardClick, onStatusChange }) {
  // Group applications by status
  const columns = useMemo(() => {
    const grouped = {}
    ALL_STATUSES.forEach((s) => { grouped[s] = [] })
    applications.forEach((app) => {
      const col = grouped[app.status]
      if (col) col.push(app)
    })
    return grouped
  }, [applications])

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result

    // Dropped outside a column or in same position
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const newStatus = destination.droppableId
    const appId = Number(draggableId)

    // Only call API if status actually changed
    if (newStatus !== source.droppableId) {
      await onStatusChange(appId, newStatus)
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-scroll pb-4">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {ALL_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={columns[status]}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  )
}
