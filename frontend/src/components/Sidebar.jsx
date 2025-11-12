import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

function Sidebar({ user }) {
  const location = useLocation()

  const menuItems = {
    student: [
      { path: '/student-dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/student-dashboard', icon: '📝', label: 'Apply Pass', action: 'apply' },
      { path: '/student-dashboard', icon: '📋', label: 'My Passes' },
      { path: '/student-dashboard', icon: '👤', label: 'Profile', action: 'profile' }
    ],
    teacher: [
      { path: '/teacher-dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/teacher-dashboard', icon: '⏳', label: 'Pending' },
      { path: '/teacher-dashboard', icon: '📋', label: 'All Passes' }
    ],
    warden: [
      { path: '/warden-dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/warden-dashboard', icon: '⏳', label: 'Pending' },
      { path: '/warden-dashboard', icon: '📋', label: 'All Passes' }
    ],
    security: [
      { path: '/security-dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/security-dashboard', icon: '📷', label: 'Scanner' },
      { path: '/security-dashboard', icon: '📜', label: 'Today\'s Scans' }
    ]
  }

  const items = menuItems[user?.role] || []

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/10 backdrop-blur-md border-r border-white/20 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">Menu</h2>
      </div>

      <nav className="space-y-2 flex-1">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path && !item.action

          return (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                to={item.path}
                onClick={(e) => {
                  if (item.action) {
                    e.preventDefault()
                    // Handle action (apply, profile) via custom event or state
                    window.dispatchEvent(new CustomEvent('sidebar-action', { detail: item.action }))
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/20">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <span className="text-xl">🏠</span>
          <span className="font-medium">Home</span>
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar




