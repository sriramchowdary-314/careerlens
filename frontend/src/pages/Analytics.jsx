import React from 'react'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'

export default function Analytics() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Insights and trends across your job search
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
