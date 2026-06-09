import React, { useState, useEffect, useCallback } from 'react'

const STATUS_OPTIONS = [
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'OA', label: 'Online Assessment' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' }
]

const EMPTY_FORM = {
  company: '',
  role: '',
  link: '',
  status: 'SAVED',
  location: '',
  salaryMin: '',
  salaryMax: '',
  appliedDate: '',
  followUpDate: '',
  notes: ''
}

function toDateInputValue(dateStr) {
  if (!dateStr) return ''
  // Handle ISO strings like "2024-03-15T00:00:00" → "2024-03-15"
  return dateStr.split('T')[0]
}

export default function ApplicationModal({ isOpen, onClose, onSubmit, initialData }) {
  const isEditing = !!initialData
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Populate form when editing or reset when creating
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          company: initialData.company || '',
          role: initialData.role || '',
          link: initialData.link || '',
          status: initialData.status || 'SAVED',
          location: initialData.location || '',
          salaryMin: initialData.salaryMin != null ? String(initialData.salaryMin) : '',
          salaryMax: initialData.salaryMax != null ? String(initialData.salaryMax) : '',
          appliedDate: toDateInputValue(initialData.appliedDate),
          followUpDate: toDateInputValue(initialData.followUpDate),
          notes: initialData.notes || ''
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
      setSubmitError(null)
    }
  }, [isOpen, initialData])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
    }
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.company.trim()) errs.company = 'Company name is required'
    if (!form.role.trim()) errs.role = 'Role / position is required'
    if (form.link && !/^https?:\/\/.+/.test(form.link)) {
      errs.link = 'Link must start with http:// or https://'
    }
    if (form.salaryMin && isNaN(Number(form.salaryMin))) {
      errs.salaryMin = 'Must be a number'
    }
    if (form.salaryMax && isNaN(Number(form.salaryMax))) {
      errs.salaryMax = 'Must be a number'
    }
    if (
      form.salaryMin &&
      form.salaryMax &&
      Number(form.salaryMax) < Number(form.salaryMin)
    ) {
      errs.salaryMax = 'Max salary must be ≥ min salary'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      link: form.link.trim() || null,
      status: form.status,
      location: form.location.trim() || null,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      appliedDate: form.appliedDate || null,
      followUpDate: form.followUpDate || null,
      notes: form.notes.trim() || null
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to save application. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit Application' : 'New Application'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            {submitError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Company */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className={`input-field ${errors.company ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                />
                {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
              </div>

              {/* Role */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role / Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  className={`input-field ${errors.role ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                />
                {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
              </div>

              {/* Status */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. New York, NY / Remote"
                  className="input-field"
                />
              </div>

              {/* Link */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Job Posting URL</label>
                <input
                  type="url"
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={`input-field ${errors.link ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                />
                {errors.link && <p className="mt-1 text-xs text-red-500">{errors.link}</p>}
              </div>

              {/* Salary Min */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Salary Min ($)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={form.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g. 80000"
                  min="0"
                  className={`input-field ${errors.salaryMin ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                />
                {errors.salaryMin && <p className="mt-1 text-xs text-red-500">{errors.salaryMin}</p>}
              </div>

              {/* Salary Max */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Salary Max ($)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={form.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g. 120000"
                  min="0"
                  className={`input-field ${errors.salaryMax ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
                />
                {errors.salaryMax && <p className="mt-1 text-xs text-red-500">{errors.salaryMax}</p>}
              </div>

              {/* Applied Date */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Applied Date</label>
                <input
                  type="date"
                  name="appliedDate"
                  value={form.appliedDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Follow-up Date */}
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Follow-up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any notes about this application…"
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <svg className="spinner h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
