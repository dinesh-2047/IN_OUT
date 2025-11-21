import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationBell from './NotificationBell'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showMobileMenu])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  // Mega menu data
  const megaMenuData = {
    services: {
      title: 'Services',
      columns: [
        {
          title: 'Gate Pass Management',
          items: [
            { name: 'Apply Gate Pass', icon: '📝', description: 'Quick application process' },
            { name: 'Track Status', icon: '📊', description: 'Real-time updates' },
            { name: 'History', icon: '📋', description: 'View past passes' },
            { name: 'QR Scanner', icon: '📱', description: 'Mobile verification' }
          ]
        },
        {
          title: 'Security Features',
          items: [
            { name: 'Verification', icon: '🔍', description: 'Multi-level approval' },
            { name: 'Access Control', icon: '🔐', description: 'Role-based access' },
            { name: 'Audit Trail', icon: '📈', description: 'Complete logs' },
            { name: 'Notifications', icon: '🔔', description: 'Instant alerts' }
          ]
        },
        {
          title: 'Analytics',
          items: [
            { name: 'Reports', icon: '📊', description: 'Detailed insights' },
            { name: 'Statistics', icon: '📈', description: 'Usage patterns' },
            { name: 'Export Data', icon: '📤', description: 'Download reports' },
            { name: 'Dashboard', icon: '🎯', description: 'Visual overview' }
          ]
        }
      ]
    },
    dashboard: {
      title: 'Dashboard',
      columns: [
        {
          title: 'User Dashboards',
          items: [
            { name: 'Student Portal', icon: '👨‍🎓', description: 'Student dashboard' },
            { name: 'Warden Panel', icon: '👨‍💼', description: 'Warden controls' },
            { name: 'Security Desk', icon: '👮', description: 'Security interface' },
            { name: 'Admin Panel', icon: '⚙️', description: 'System settings' }
          ]
        },
        {
          title: 'Quick Actions',
          items: [
            { name: 'New Request', icon: '➕', description: 'Create new pass' },
            { name: 'Pending Reviews', icon: '⏳', description: 'Awaiting approval' },
            { name: 'Approved Passes', icon: '✅', description: 'Active passes' },
            { name: 'Rejected Requests', icon: '❌', description: 'Denied applications' }
          ]
        },
        {
          title: 'Settings',
          items: [
            { name: 'Profile', icon: '👤', description: 'Personal info' },
            { name: 'Preferences', icon: '⚙️', description: 'Customize app' },
            { name: 'Notifications', icon: '🔔', description: 'Alert settings' },
            { name: 'Help & Support', icon: '❓', description: 'Get assistance' }
          ]
        }
      ]
    },
    resources: {
      title: 'Resources',
      columns: [
        {
          title: 'Documentation',
          items: [
            { name: 'User Guide', icon: '📖', description: 'Complete manual' },
            { name: 'API Docs', icon: '🔧', description: 'Developer resources' },
            { name: 'Video Tutorials', icon: '🎥', description: 'Step-by-step guides' },
            { name: 'FAQs', icon: '❓', description: 'Common questions' }
          ]
        },
        {
          title: 'Support',
          items: [
            { name: 'Contact Us', icon: '📧', description: 'Get help' },
            { name: 'Live Chat', icon: '💬', description: 'Instant support' },
            { name: 'Community', icon: '👥', description: 'User forum' },
            { name: 'Feedback', icon: '💭', description: 'Share ideas' }
          ]
        },
        {
          title: 'Company',
          items: [
            { name: 'About Us', icon: '🏢', description: 'Our story' },
            { name: 'Careers', icon: '💼', description: 'Join our team' },
            { name: 'Privacy Policy', icon: '🔒', description: 'Data protection' },
            { name: 'Terms of Service', icon: '📋', description: 'Legal terms' }
          ]
        }
      ]
    }
  }

  const getRoleDisplay = (role) => {
    if (!role) return 'User'

    switch (role) {
      case 'student':
        return 'Student'
      case 'teacher':
        return 'Teacher'
      case 'warden':
        return 'Warden'
      case 'security':
        return 'Security'
      default:
        return role
    }
  }

  const displayName = (user?.fullName || user?.name || user?.username || user?.email || '').trim()
  const profileInitial = displayName ? displayName.charAt(0).toUpperCase() : '?'

  const handleDropdownToggle = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName)
  }

  const closeMobileMenu = () => setShowMobileMenu(false)

  // Mega Dropdown Component
  const MegaDropdown = ({ menuKey, data }) => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setActiveDropdown(activeDropdown === menuKey ? null : menuKey)}
        onMouseEnter={() => setActiveDropdown(menuKey)}
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
          activeDropdown === menuKey
            ? isDark
              ? 'text-white bg-gray-700/50'
              : 'text-gray-900 bg-gray-100'
            : isDark
              ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <span>{data.title}</span>
        <motion.svg
          className="w-4 h-4"
          animate={{ rotate: activeDropdown === menuKey ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {activeDropdown === menuKey && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="fixed left-0 right-0 top-full mt-2 mx-auto max-w-7xl z-50"
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className={`rounded-2xl shadow-2xl border backdrop-blur-xl ${
              isDark 
                ? 'bg-gray-800/95 border-gray-700' 
                : 'bg-white/95 border-gray-200'
            } p-6`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.columns.map((column, colIndex) => (
                  <div key={colIndex} className="space-y-4">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {column.title}
                    </h3>
                    <div className="space-y-3">
                      {column.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          to={`/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                            isDark 
                              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          <div className="text-xl mt-0.5">{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className={`text-xs mt-0.5 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom banner with CTA */}
              <div className={`mt-6 pt-6 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-800'
                    }`}>
                      Need help getting started?
                    </h4>
                    <p className={`text-xs mt-0.5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Check out our documentation or contact support
                    </p>
                  </div>
                  <Link
                    to="/help"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:scale-105"
                  >
                    Get Help
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // NavLinks Component with Mega Menu
  const NavLinks = () => (
    <div className="hidden lg:flex items-center space-x-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
              : isDark
              ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }`
        }
      >
        Home
      </NavLink>
      
      <MegaDropdown menuKey="services" data={megaMenuData.services} />
      <MegaDropdown menuKey="dashboard" data={megaMenuData.dashboard} />
      <MegaDropdown menuKey="resources" data={megaMenuData.resources} />

      {!user && (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : isDark
                ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`
          }
        >
          Login
        </NavLink>
      )}
    </div>
  )

  return (
    <>
      <nav
      className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${
        isDark
          ? 'bg-black/50 border-gray-800'
          : 'bg-white/50 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              <span className="text-white text-xl font-bold">InOut</span>
            </motion.div>
            <h1 className="hidden sm:block text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              InOut
            </h1>
          </div>

          <NavLinks />

          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`lg:hidden p-2 rounded-full border ${isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-700'}`}
              onClick={() => setShowMobileMenu(true)}
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h12" />
              </svg>
            </button>
            {user ? (
              <>
                <NotificationBell user={user} />
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {profileInitial}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {displayName || 'User'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {getRoleDisplay(user?.role)}
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-600 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.button>

                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5"
                    >
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          window.dispatchEvent(new CustomEvent('open-profile'))
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        View Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4"
                          />
                        </svg>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:shadow-xl"
              >
                Sign In
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                isDark
                  ? 'bg-gray-800/60 text-yellow-400 hover:bg-gray-700/60'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>

    <AnimatePresence>
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileMenu}
            role="presentation"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className={`absolute right-0 top-0 h-full w-80 max-w-full p-6 overflow-y-auto border-l backdrop-blur-xl ${
              isDark ? 'bg-gray-900/90 border-gray-800 text-white' : 'bg-white/90 border-gray-200 text-gray-900'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Navigate</h2>
              <button
                type="button"
                onClick={closeMobileMenu}
                className={`p-2 rounded-full border text-lg ${
                  isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-700'
                }`}
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`block px-4 py-3 rounded-2xl font-semibold ${
                  isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                Home
              </Link>
              {Object.entries(megaMenuData).map(([key, section]) => (
                <div key={key} className="space-y-3">
                  <p className="text-xs uppercase tracking-widest opacity-70">{section.title}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {section.columns.flatMap((column) => column.items).map((item) => (
                      <Link
                        key={`${key}-${item.name}`}
                        to={`/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={closeMobileMenu}
                        className={`rounded-xl px-4 py-3 flex items-center gap-3 border ${
                          isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs opacity-70">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

export default Navbar

