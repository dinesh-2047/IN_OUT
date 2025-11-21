import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import apiClient from '../lib/apiClient'

function ProfileModal({ isOpen, onClose }) {
  const { user, refresh } = useAuth()
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    studentId: user?.studentId || '',
    employeeId: user?.employeeId || '',
    contactNumber: user?.contactNumber || '',
    course: user?.course || '',
    roomNumber: user?.roomNumber || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      studentId: user?.studentId || '',
      employeeId: user?.employeeId || '',
      contactNumber: user?.contactNumber || '',
      course: user?.course || '',
      roomNumber: user?.roomNumber || ''
    })
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = {}
      const updatableFields = ['fullName', 'studentId', 'employeeId', 'contactNumber', 'course', 'roomNumber']

      updatableFields.forEach((field) => {
        if (typeof formData[field] !== 'undefined' && formData[field] !== user?.[field]) {
          payload[field] = formData[field]
        }
      })

      if (!Object.keys(payload).length) {
        setMessage('No changes to update')
        setLoading(false)
        return
      }

      await apiClient.patch('/users/profile', payload)
      await refresh()
      setMessage('Profile updated successfully!')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Photo */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>

              {user?.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {user?.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Number
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {user && user.role !== 'student' && user.role !== 'security' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {['student', 'teacher', 'class_incharge', 'classincharge'].includes(user?.role) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course / Section
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProfileModal




