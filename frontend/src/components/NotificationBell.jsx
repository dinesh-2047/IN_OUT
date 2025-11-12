import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../lib/apiClient'
import { PASS_STATUS } from '../constants/gatepass'

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const seenRequestIdsRef = useRef(new Set())

  useEffect(() => {
    if (!user) return

    seenRequestIdsRef.current = new Set()
    setNotifications([])
    setUnreadCount(0)

    fetchNotifications()

    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const params = {}

      if (user?.role === 'student') {
        params.status = PASS_STATUS.APPROVED
      } else if (user?.role) {
        params.status = PASS_STATUS.PENDING
      }

      const response = await apiClient.get('/gatepasses', { params })
      const requests = response.data?.data || []

      if (user?.role === 'student') {
        const newNotifications = requests
          .filter((request) => {
            if (request.status !== PASS_STATUS.APPROVED) return false
            if (!request.gatePassToken) return false
            if (seenRequestIdsRef.current.has(request._id)) return false
            seenRequestIdsRef.current.add(request._id)
            return true
          })
          .map((request) => ({
            id: request._id,
            type: 'approval',
            message: `Your gate pass for ${request.destination} is ready.`,
            timestamp: new Date(request.updatedAt || request.createdAt || Date.now()),
            read: false,
          }))

        if (newNotifications.length > 0) {
          setNotifications((prev) => [...newNotifications, ...prev])
          setUnreadCount((prev) => prev + newNotifications.length)
        }
      } else if (user?.role) {
        const newNotifications = requests
          .filter((request) => {
            if (request.status !== PASS_STATUS.PENDING) return false
            if (seenRequestIdsRef.current.has(request._id)) return false
            seenRequestIdsRef.current.add(request._id)
            return true
          })
          .map((request) => ({
            id: request._id,
            type: 'pending',
            message: `Gate pass request from ${request.student?.fullName || request.student?.username || 'a student'} is awaiting action.`,
            timestamp: new Date(request.createdAt || Date.now()),
            read: false,
          }))

        if (newNotifications.length > 0) {
          setNotifications((prev) => [...newNotifications, ...prev])
          setUnreadCount((prev) => prev + newNotifications.length)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-700 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{notif.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notif.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell




