import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import apiClient from '../lib/apiClient'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import QRDisplay from '../components/QRDisplay'
import {
  ROLE_TO_STAGE,
  STAGE_LABELS,
  getNextStage,
  PASS_STATUS,
  PASS_STAGES,
} from '../constants/gatepass'

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value._id) return value._id
    if (typeof value.toString === 'function') return value.toString()
  }
  return ''
}

function formatDate(date) {
  if (!date) return '--'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return '--'
  }
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(date) {
  if (!date) return '--'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return '--'
  }
  return parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function ApproverDashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [gatepasses, setGatepasses] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [remarks, setRemarks] = useState({})

  const approverStage = useMemo(() => ROLE_TO_STAGE[user?.role] ?? null, [user?.role])
  const isHistoryView = filter === 'history'
  const currentUserId = normalizeId(user?._id || user?.id)

  const fetchGatepasses = useCallback(async () => {
    if (!user) return

    setLoading(true)

    try {
      const params = {}

      if (filter === 'pending') {
        params.status = PASS_STATUS.PENDING
      }

      if (filter === 'history') {
        params.actedByMe = true
      }

      if (approverStage && filter !== 'history') {
        params.stage = approverStage
      }

      const response = await apiClient.get('/gatepasses', { params })
      setGatepasses(response.data?.data || [])
    } catch (error) {
      console.error('Error fetching gatepasses:', error)
    } finally {
      setLoading(false)
    }
  }, [approverStage, filter, user])

  useEffect(() => {
    fetchGatepasses()
  }, [fetchGatepasses])

  const handleAction = async (requestId, action) => {
    try {
      setActionLoading(requestId)
      const payload = {
        action,
      }

      if (remarks[requestId]) {
        payload.remarks = remarks[requestId]
      }

      await apiClient.post(`/gatepasses/${requestId}/decision`, payload)
      setRemarks((prev) => ({ ...prev, [requestId]: '' }))
      await fetchGatepasses()
    } catch (error) {
      console.error('Error processing action:', error)
      const message = error.response?.data?.message || 'Failed to process request'
      alert(message)
    } finally {
      setActionLoading(null)
    }
  }

  const updateRemark = (requestId, value) => {
    setRemarks((prev) => ({ ...prev, [requestId]: value }))
  }

  const canActOnRequest = (request) => {
    if (!approverStage) return false
    if (!request) return false
    if (request.status !== PASS_STATUS.PENDING) return false
    return request.currentStage === approverStage
  }

  const canForwardRequest = (request) => {
    if (!request) return false
    const nextStage = getNextStage(request.currentStage)
    if (!nextStage) return false
    return nextStage !== PASS_STAGES.COMPLETED
  }

  const pageBgClass = isDark
    ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-indigo-50'
    : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 text-white'

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${pageBgClass}`}>
      <Navbar />
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                Approver Dashboard
              </h1>
              <p className="mt-2 text-sm md:text-base text-white/90">
                Welcome, {user?.fullName || user?.username}
              </p>
              {approverStage ? (
                <p className="mt-1 text-xs text-white/70">
                  Current stage: {STAGE_LABELS[approverStage] || approverStage}
                </p>
              ) : (
                <p className="mt-1 text-xs text-red-100">
                  Your role is not configured for gate pass approvals.
                </p>
              )}
            </div>

            <div className="mb-4 md:mb-6 flex flex-wrap gap-2 sm:gap-4 bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-gray-800/70 p-3 md:p-4">
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base flex-1 sm:flex-initial ${
                  filter === 'pending'
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Pending ({gatepasses.filter((request) => request.status === PASS_STATUS.PENDING).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base flex-1 sm:flex-initial ${
                  filter === 'all'
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setFilter('history')}
                className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base flex-1 sm:flex-initial ${
                  filter === 'history'
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                My History
              </button>
            </div>

            {isHistoryView && (
              <div className="mb-4 text-sm text-white/80 bg-white/10 dark:bg-gray-900/60 rounded-xl border border-white/20 dark:border-gray-800/70 p-3">
                Showing gate passes where you have already taken an action.
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-white/80">Loading requests...</div>
            ) : gatepasses.length === 0 ? (
              <div className="text-center py-12 text-white/80 bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-gray-800/70">
                {filter === 'pending'
                  ? 'No pending gate pass applications at the moment.'
                  : filter === 'history'
                    ? 'No past decisions found yet.'
                    : 'No gate pass applications found.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {gatepasses.map((request) => {
                  const student = request.student || {}
                  const nextStage = getNextStage(request.currentStage)
                  const isPending = request.status === PASS_STATUS.PENDING
                  const canAct = canActOnRequest(request)
                  const canForward = canForwardRequest(request)
                  const courseLabel = request.studentCourse || student.course
                  const roomLabel = student.roomNumber || request.studentRoomNumber
                  const myDecision = (request.history || []).find(
                    (entry) => normalizeId(entry.actedBy) === currentUserId
                  )
                  const myDecisionLabel = myDecision?.action
                    ? myDecision.action.charAt(0).toUpperCase() + myDecision.action.slice(1)
                    : ''

                  return (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-800/70 rounded-xl p-6 hover:bg-white/20 dark:hover:bg-gray-900 transition-all shadow-xl"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <StatusBadge status={request.status} currentStage={request.currentStage} />
                        <span className="text-xs text-white/70">#{request._id?.slice(-6)}</span>
                      </div>

                      <div className="space-y-3 text-sm text-white">
                        <div className="bg-white/10 dark:bg-gray-800/60 p-3 rounded-lg">
                          <h3 className="font-semibold text-white mb-1">
                            {student.fullName || student.username || 'Unknown Student'}
                          </h3>
                          {student.studentId && (
                            <p className="text-xs text-white/80">Student ID: {student.studentId}</p>
                          )}
                          {courseLabel && (
                            <p className="text-xs text-white/80">Course: {courseLabel}</p>
                          )}
                          {roomLabel && (
                            <p className="text-xs text-white/80">Room: {roomLabel}</p>
                          )}
                          {student.email && (
                            <p className="text-xs text-white/75 truncate">Email: {student.email}</p>
                          )}
                        </div>
                        {myDecision && (
                          <div className="bg-white/10 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700 rounded-lg mt-3 p-3 text-xs text-white/80 space-y-1">
                            <p className="font-semibold text-white">Your Decision</p>
                            <p>Stage: {STAGE_LABELS[myDecision.stage] || myDecision.stage}</p>
                            <p>Action: {myDecisionLabel}</p>
                            <p>
                              When: {formatDate(myDecision.actedAt)} {formatTime(myDecision.actedAt)}
                            </p>
                            {myDecision.remarks && <p>Remarks: {myDecision.remarks}</p>}
                          </div>
                        )}
                        <p><strong>Reason:</strong> {request.reason}</p>
                        <p><strong>Destination:</strong> {request.destination}</p>
                        <p>
                          <strong>Out:</strong> {formatDate(request.outTime)} • {formatTime(request.outTime)}
                        </p>
                        <p>
                          <strong>Expected Return:</strong> {formatDate(request.expectedReturnTime)} • {formatTime(request.expectedReturnTime)}
                        </p>
                        <p className="text-xs text-white/70">
                          Current Stage: {STAGE_LABELS[request.currentStage] || request.currentStage}
                        </p>
                        <p className="text-xs text-white/70">
                          Applied: {formatDate(request.createdAt)} {formatTime(request.createdAt)}
                        </p>
                      </div>

                      {request.history?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/75 space-y-2">
                          <p className="font-semibold text-white">History</p>
                          <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {request.history.map((entry, idx) => (
                              <li key={`${request._id}-history-${idx}`} className="flex flex-col">
                                <span>
                                  <strong>{STAGE_LABELS[entry.stage] || entry.stage}:</strong> {entry.action}
                                  {entry.forwardedTo
                                    ? ` → ${STAGE_LABELS[entry.forwardedTo] || entry.forwardedTo}`
                                    : ''}
                                </span>
                                {entry.remarks && <span className="text-white/65">Remarks: {entry.remarks}</span>}
                                <span className="text-white/50">
                                  {formatDate(entry.actedAt)} {formatTime(entry.actedAt)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {isPending && canAct && (
                        <div className="mt-4">
                          <textarea
                            rows={2}
                            placeholder="Add optional remarks"
                            value={remarks[request._id] || ''}
                            onChange={(event) => updateRemark(request._id, event.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-white/30 dark:border-gray-700 bg-white/10 dark:bg-gray-800/60 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                          />
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-2">
                        {isPending && canAct ? (
                          <div className="flex flex-col sm:flex-row sm:gap-2">
                            <button
                              onClick={() => handleAction(request._id, 'approve')}
                              disabled={actionLoading === request._id}
                              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                            >
                              {actionLoading === request._id ? 'Processing...' : 'Approve'}
                            </button>
                            {canForward && (
                              <button
                                onClick={() => handleAction(request._id, 'forward')}
                                disabled={actionLoading === request._id}
                                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                              >
                                {actionLoading === request._id ? 'Processing...' : `Forward to ${STAGE_LABELS[nextStage]}`}
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(request._id, 'reject')}
                              disabled={actionLoading === request._id}
                              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                            >
                              {actionLoading === request._id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-white/70">
                            {isPending
                              ? 'Awaiting action at another stage.'
                              : request.status === PASS_STATUS.APPROVED
                                ? 'Request approved. Token issued below.'
                                : 'Request processing completed.'}
                          </p>
                        )}

                        {request.status === PASS_STATUS.APPROVED && request.gatePassToken && (
                          <div className="mt-4">
                            <QRDisplay
                              tokenValue={request.gatePassToken.value}
                              gatepass={request}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApproverDashboard
