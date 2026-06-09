import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { applicationsApi } from '../../services/api'

const STATUS_COLORS = {
  SAVED: '#9ca3af',
  APPLIED: '#3b82f6',
  OA: '#f59e0b',
  INTERVIEW: '#8b5cf6',
  OFFER: '#22c55e',
  REJECTED: '#ef4444'
}

const STATUS_LABELS = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  OA: 'Online Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected'
}

function StatCard({ title, value, subtitle, valueClass = '', icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`mt-1 text-3xl font-bold tracking-tight ${valueClass || 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-gray-400">
      {message}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await applicationsApi.getAnalytics()
        if (!cancelled) setAnalytics(response.data)
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load analytics data.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="spinner h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Loading analytics…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        {error}
      </div>
    )
  }

  const {
    totalApplications = 0,
    responseRate = 0,
    avgDaysToResponse = 0,
    overdueFollowUps = 0,
    statusBreakdown = {},
    applicationsPerWeek = []
  } = analytics || {}

  // Active applications: not OFFER or REJECTED
  const activeApplications = Object.entries(statusBreakdown)
    .filter(([key]) => key !== 'OFFER' && key !== 'REJECTED')
    .reduce((acc, [, val]) => acc + val, 0)

  // Pie chart data
  const pieData = Object.entries(statusBreakdown)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      name: STATUS_LABELS[key] || key,
      value: count,
      color: STATUS_COLORS[key] || '#6b7280'
    }))

  // Status funnel data sorted by pipeline order
  const statusOrder = ['SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED']
  const maxCount = Math.max(...statusOrder.map((s) => statusBreakdown[s] || 0), 1)
  const funnelData = statusOrder
    .map((key) => ({
      key,
      label: STATUS_LABELS[key],
      count: statusBreakdown[key] || 0,
      color: STATUS_COLORS[key]
    }))
    .filter((d) => d.count > 0 || totalApplications === 0)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          subtitle="All time"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Response Rate"
          value={`${Math.round(responseRate * 100)}%`}
          subtitle={avgDaysToResponse > 0 ? `Avg ${Math.round(avgDaysToResponse)} days to respond` : 'No responses yet'}
          valueClass={responseRate >= 0.2 ? 'text-green-600' : 'text-gray-900'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          title="Active Applications"
          value={activeApplications}
          subtitle="Not yet resolved"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          title="Overdue Follow-ups"
          value={overdueFollowUps}
          subtitle={overdueFollowUps > 0 ? 'Action needed!' : 'All caught up'}
          valueClass={overdueFollowUps > 0 ? 'text-red-600' : 'text-green-600'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications per week bar chart */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Applications Over Time</h3>
          {applicationsPerWeek.length === 0 ? (
            <EmptyState message="No application data yet. Start tracking!" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={applicationsPerWeek} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    // val is something like "2024-W12" → show "W12"
                    if (val && val.includes('-W')) return val.split('-W')[1] ? `W${val.split('-W')[1]}` : val
                    return val
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                  cursor={{ fill: '#eff6ff' }}
                  formatter={(value) => [value, 'Applications']}
                  labelFormatter={(label) => `Week: ${label}`}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribution pie chart */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Status Distribution</h3>
          {pieData.length === 0 ? (
            <EmptyState message="No applications to display yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status funnel */}
      <div className="card p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Application Funnel</h3>
        {totalApplications === 0 ? (
          <EmptyState message="Add some applications to see your funnel." />
        ) : (
          <div className="space-y-3">
            {funnelData.map(({ key, label, count, color }) => {
              const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-right text-sm font-medium text-gray-600">
                    {label}
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                          minWidth: count > 0 ? '4px' : '0'
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-gray-700">
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
