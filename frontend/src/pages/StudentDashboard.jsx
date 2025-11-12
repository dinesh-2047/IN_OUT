import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import apiClient from '../lib/apiClient'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import GatepassForm from '../components/GatepassForm'
import QRDisplay from '../components/QRDisplay'
import StatusBadge from '../components/StatusBadge'
import StatusTracker from '../components/StatusTracker'
import AnnouncementsBanner from '../components/AnnouncementsBanner'
import ProfileModal from '../components/ProfileModal'
import WardenInfoModal from '../components/WardenInfoModal'
import { PASS_STATUS, STAGE_LABELS } from '../constants/gatepass'

function formatDateTime(value, options) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString(undefined, options)
}

function StudentDashboard() {
  const { user } = useAuth()
  const [gatepasses, setGatepasses] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showWardenModal, setShowWardenModal] = useState(false)
  const [selectedPassId, setSelectedPassId] = useState(null)

  useEffect(() => {
    fetchGatepasses()

    const handleSidebarAction = (event) => {
      if (event.detail === 'apply') {
        setShowForm(true)
      }
      if (event.detail === 'profile') {
        setShowProfileModal(true)
      }
    }

    const handleOpenProfile = () => setShowProfileModal(true)

    window.addEventListener('sidebar-action', handleSidebarAction)
    window.addEventListener('open-profile', handleOpenProfile)

    return () => {
      window.removeEventListener('sidebar-action', handleSidebarAction)
      window.removeEventListener('open-profile', handleOpenProfile)
    }
  }, [])

  const fetchGatepasses = async () => {
    setIsFetching(true)
    try {
      const response = await apiClient.get('/gatepasses')
      setGatepasses(response.data?.data || [])
      setError('')
    } catch (fetchError) {
      console.error('Error fetching gatepasses:', fetchError)
      setError(fetchError.response?.data?.message || fetchError.message || 'Unable to load gatepasses')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (payload) => {
    setError('')
    setIsSubmitting(true)

    try {
      await apiClient.post('/gatepasses', payload)
      setShowForm(false)
      await fetchGatepasses()
    } catch (submitError) {
      const message = submitError.response?.data?.message || submitError.message || 'Failed to apply for gate pass'
      setError(message)
      throw submitError
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPass = useMemo(
    () => gatepasses.find((gatepass) => gatepass._id === selectedPassId) || null,
    [gatepasses, selectedPassId]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600">
      <Navbar />
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">Student Dashboard</h1>
              <p className="mt-2 text-sm md:text-base text-white/90">
                Welcome, {user?.fullName || user?.username}
              </p>
            </div>

            <AnnouncementsBanner />

            <div className="mb-6 flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm((prev) => !prev)}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30 shadow-lg"
              >
                {showForm ? 'Cancel Application' : '+ Apply for Gate Pass'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWardenModal(true)}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30 shadow-lg"
              >
                👔 Know Your Warden
              </motion.button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-100 rounded-xl text-sm">
                {error}
              </div>
            )}

            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 drop-shadow-md">
                  New Gate Pass Application
                </h2>
                <GatepassForm onSubmit={handleSubmit} loading={isSubmitting} />
              </motion.div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-white drop-shadow-md">My Gate Passes</h2>
                {isFetching && <span className="text-xs text-white/70">Refreshing...</span>}
              </div>

              {gatepasses.length === 0 ? (
                <div className="text-center py-12 text-white/80">
                  <p className="text-lg">No gate pass applications yet</p>
                  <p className="text-sm mt-2">Click "Apply for Gate Pass" to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {gatepasses.map((gatepass) => {
                    const appliedDate = formatDateTime(gatepass.createdAt)
                    const outDate = formatDateTime(gatepass.outTime, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    const inDate = formatDateTime(gatepass.expectedReturnTime, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    const isSelected = selectedPassId === gatepass._id

                    return (
                      <motion.div
                        key={gatepass._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedPassId(isSelected ? null : gatepass._id)}
                        className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 md:p-5 cursor-pointer hover:bg-white/30 transition-all ${
                          isSelected ? 'ring-2 ring-white/70' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <StatusBadge status={gatepass.status} currentStage={gatepass.currentStage} />
                          <span className="text-xs text-white/80">
                            {STAGE_LABELS[gatepass.currentStage] || gatepass.currentStage}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-white">
                          <p><strong>Reason:</strong> {gatepass.reason}</p>
                          <p><strong>Destination:</strong> {gatepass.destination}</p>
                          <p>
                            <strong>Out:</strong> {outDate}
                          </p>
                          <p>
                            <strong>Expected return:</strong> {inDate}
                          </p>
                          <p className="text-xs text-white/70">Applied: {appliedDate}</p>
                        </div>
                        {gatepass.status === PASS_STATUS.APPROVED && gatepass.gatePassToken && (
                          <div className="mt-4 pt-4 border-t border-white/30">
                            <QRDisplay tokenValue={gatepass.gatePassToken.value} gatepass={gatepass} />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedPass && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 md:p-6 mb-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white drop-shadow-md">
                    Application Status Tracker
                  </h3>
                  <span className="text-xs text-white/70">
                    Current stage: {STAGE_LABELS[selectedPass.currentStage] || selectedPass.currentStage}
                  </span>
                </div>
                <StatusTracker
                  status={selectedPass.status}
                  currentStage={selectedPass.currentStage}
                  history={selectedPass.history || []}
                />
              </motion.div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 md:p-6 overflow-x-auto">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4 drop-shadow-md">Pass History</h2>
              {gatepasses.length === 0 ? (
                <p className="text-white/80 text-center py-8">No pass history available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/30 text-left">
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Out</th>
                        <th className="py-3 px-4">Return</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gatepasses.map((gatepass) => (
                        <tr key={gatepass._id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-4">{gatepass.destination}</td>
                          <td className="py-3 px-4">{formatDateTime(gatepass.outTime)}</td>
                          <td className="py-3 px-4">{formatDateTime(gatepass.expectedReturnTime)}</td>
                          <td className="py-3 px-4 text-xs">
                            {STAGE_LABELS[gatepass.currentStage] || gatepass.currentStage}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={gatepass.status} currentStage={gatepass.currentStage} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <WardenInfoModal isOpen={showWardenModal} onClose={() => setShowWardenModal(false)} />
    </div>
  )
}

export default StudentDashboard
