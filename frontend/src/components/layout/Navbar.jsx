import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function NavLinkItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
              JobTrackr
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 sm:flex">
            <NavLinkItem to="/dashboard">Dashboard</NavLinkItem>
            <NavLinkItem to="/analytics">Analytics</NavLinkItem>
          </div>

          {/* Desktop right side */}
          <div className="hidden items-center gap-4 sm:flex">
            {user && (
              <span className="text-sm font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary text-xs"
            >
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 sm:hidden">
          <div className="flex flex-col gap-1">
            <NavLinkItem to="/dashboard" onClick={closeMenu}>Dashboard</NavLinkItem>
            <NavLinkItem to="/analytics" onClick={closeMenu}>Analytics</NavLinkItem>
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3">
            {user && (
              <p className="mb-2 text-sm font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </p>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary w-full text-xs"
            >
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
