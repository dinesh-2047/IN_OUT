import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import apiClient from '../lib/apiClient'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Scanner from '../components/Scanner'
import StatusBadge from '../components/StatusBadge'
import { PASS_STATUS, STAGE_LABELS } from '../constants/gatepass'

const formatDateTime = (value) => {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '--'
  }
  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function SecurityDashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [scanResult, setScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [usageRows, setUsageRows] = useState([])
  const [isFetchingUsage, setIsFetchingUsage] = useState(false)
  const [usageError, setUsageError] = useState('')

  const fetchUsageLogs = useCallback(async () => {
    setIsFetchingUsage(true)
    try {
      const response = await apiClient.get('/gatepasses', { params: { status: PASS_STATUS.APPROVED } })
      const requests = response.data?.data || []
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const rows = []

      requests.forEach((request) => {
        const token = request?.gatePassToken
        if (!token) return

        const student = request.student || {}

        ;(token.usageLog || []).forEach((entry, index) => {
          const usedAt = entry?.usedAt ? new Date(entry.usedAt) : null
          if (!usedAt || Number.isNaN(usedAt.getTime()) || usedAt < startOfDay) {
            return
          }

          rows.push({
            id: `${token._id || token.value}-${index}`,
            studentName: student.fullName || student.username || 'Unknown',
            studentId: student.studentId || '--',
            usedAt,
            type: entry.type || 'scan',
            tokenStatus: token.status,
            tokenValue: token.value,
            requestStatus: request.status,
          })
        })
      })

      rows.sort((a, b) => b.usedAt - a.usedAt)
      setUsageRows(rows)
      setUsageError('')
    } catch (error) {
      console.error('Error fetching usage logs:', error)
      setUsageError(error.response?.data?.message || error.message || 'Unable to fetch scanned passes')
    } finally {
      setIsFetchingUsage(false)
    }
  }, [])

  useEffect(() => {
    fetchUsageLogs()
    const interval = setInterval(fetchUsageLogs, 30000)
    return () => clearInterval(interval)
  }, [fetchUsageLogs])

  const extractTokenKey = (decodedText) => {
    if (!decodedText) return ''

    let parsedValue = decodedText

    try {
      parsedValue = JSON.parse(decodedText)
    } catch (error) {
      parsedValue = decodedText
    }

    if (typeof parsedValue === 'string') {
      return parsedValue.trim()
    }

    if (parsedValue && typeof parsedValue === 'object') {
      if (parsedValue.token) return String(parsedValue.token).trim()
      if (parsedValue.key) return String(parsedValue.key).trim()
      if (parsedValue.gatepass) return String(parsedValue.gatepass).trim()
    }

    return ''
  }

  const handleScan = async (decodedText) => {
    if (!decodedText || isScanning) {
      return
    }

    const tokenKey = extractTokenKey(decodedText)

    if (!tokenKey) {
      setScanError('Unable to read gate pass token from QR code')
      return
    }

    setIsScanning(true)
    setScanError('')

    try {
      const response = await apiClient.post('/gatepasses/tokens/scan', { key: tokenKey })
      const { token, remainingUses } = response.data?.data || {}
      const request = token?.request

      setScanResult({
        valid: true,
        token,
        request,
        remainingUses,
        message: response.data?.message || 'Gate pass validated',
      })

      await fetchUsageLogs()
    } catch (error) {
      console.error('Failed to validate gate pass token:', error)
      const message = error.response?.data?.message || error.message || 'Invalid or expired gate pass token'
      setScanError(message)
      setScanResult({ valid: false, message })
    } finally {
      setIsScanning(false)
    }
  }

  const handleScannerError = (err) => {
    console.log('QR Scanner info:', err)
  }

  const resetScan = () => {
    setScanResult(null)
    setScanError('')
  }

  const resultStudent = useMemo(() => scanResult?.request?.student || {}, [scanResult])
  const resultToken = scanResult?.token
  const resultRequest = scanResult?.request
  const remainingUses = scanResult?.remainingUses
  const canShowScanner = !scanResult && !isScanning
  const resultRoom = resultRequest?.studentRoomNumber || resultStudent.roomNumber

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
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">Security Dashboard</h1>
              <p className="mt-2 text-sm md:text-base text-white/90">Welcome, {user?.fullName || user?.username}</p>
            </div>

            <div className="bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-gray-800/70 p-4 md:p-6 lg:p-8 mb-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white mb-6 text-center drop-shadow-md">
                QR Code Scanner
              </h2>

              {canShowScanner && (
                <Scanner onScan={handleScan} onError={handleScannerError} />
              )}

              {isScanning && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mb-4" />
                  <p className="mt-4 text-white font-semibold">Validating QR code...</p>
                </div>
              )}

              {scanError && (
                <div className="mb-4 p-4 bg-red-500/20 dark:bg-red-900/30 backdrop-blur-sm border border-red-400/50 dark:border-red-700 text-red-100 dark:text-red-200 rounded-xl text-sm">
                  {scanError}
                </div>
              )}

              {scanResult && (
                <div
                  className={`p-6 md:p-8 rounded-lg animate-fadeIn ${
                    scanResult.valid
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 shadow-lg dark:from-emerald-950 dark:to-green-900 dark:border-emerald-700 dark:text-emerald-100'
                      : 'bg-red-50 border-2 border-red-500 dark:bg-red-950 dark:border-red-700 dark:text-red-100'
                  }`}
                >
                  <div className="text-center mb-6">
                    <motion.div
                      className="text-6xl md:text-7xl mb-4 inline-block"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.4, repeat: 2 }}
                    >
                      {scanResult.valid ? '✅' : '❌'}
                    </motion.div>
                    <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${
                      scanResult.valid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {scanResult.valid ? 'Gate pass verified!' : scanResult.message || 'Validation failed'}
                    </h3>
                    {scanResult.valid && (
                      <p className="text-lg md:text-xl text-green-600 font-semibold mt-2">
                        Remaining uses: {typeof remainingUses === 'number' ? remainingUses : '--'}
                      </p>
                    )}
                  </div>

                  {scanResult.valid && resultRequest && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                      <div className="bg-white dark:bg-gray-900 p-4 md:p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-primary-600 mb-3 text-lg flex items-center gap-2">
                          <span>👤</span> Student Information
                        </h4>
                        <div className="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-100">
                          <p><strong>Name:</strong> {resultStudent.fullName || resultStudent.username || 'Unknown'}</p>
                          <p><strong>Student ID:</strong> {resultStudent.studentId || '--'}</p>
                          <p><strong>Room:</strong> {resultRoom || '--'}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-4 md:p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-primary-600 mb-3 text-lg flex items-center gap-2">
                          <span>📋</span> Gate pass Details
                        </h4>
                        <div className="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-100">
                          <p><strong>Reason:</strong> {resultRequest.reason}</p>
                          <p><strong>Destination:</strong> {resultRequest.destination}</p>
                          <p><strong>Out:</strong> {formatDateTime(resultRequest.outTime)}</p>
                          <p><strong>Expected Return:</strong> {formatDateTime(resultRequest.expectedReturnTime)}</p>
                          <p><strong>Stage:</strong> {STAGE_LABELS[resultRequest.currentStage] || resultRequest.currentStage}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-4 md:p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-sm md:text-base text-gray-700 dark:text-gray-100 space-y-1">
                            <p><strong>Token:</strong> {resultToken?.value || 'Unknown'}</p>
                            <p><strong>Status:</strong> {resultToken?.status || 'active'}</p>
                            <p><strong>Uses:</strong> {resultToken?.usesCount || 0} / {resultToken?.usesAllowed || 2}</p>
                            <p><strong>Expires:</strong> {formatDateTime(resultToken?.expiresAt)}</p>
                          </div>
                          <StatusBadge status={resultRequest.status} currentStage={resultRequest.currentStage} />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={resetScan}
                    className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Scan Another QR Code
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white/10 dark:bg-gray-900/60 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-gray-800/70 p-4 md:p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white drop-shadow-md">
                  Today&apos;s Gate Pass Activity
                </h2>
                {isFetchingUsage && <span className="text-xs text-white/70">Refreshing...</span>}
              </div>

              {usageError && (
                <div className="mb-4 p-4 bg-red-500/20 dark:bg-red-900/30 backdrop-blur-sm border border-red-400/50 dark:border-red-700 text-red-100 dark:text-red-200 rounded-xl text-sm">
                  {usageError}
                </div>
              )}

              {usageRows.length === 0 ? (
                <p className="text-white/80 text-center py-8">No gate passes scanned today.</p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/30">
                          <th className="text-left py-3 px-4">Student</th>
                          <th className="text-left py-3 px-4">Student ID</th>
                          <th className="text-left py-3 px-4">Scan Time</th>
                          <th className="text-left py-3 px-4">Direction</th>
                          <th className="text-left py-3 px-4">Token</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageRows.map((row) => (
                          <tr key={row.id} className="border-b border-white/10 hover:bg-white/5 dark:border-gray-800 dark:hover:bg-gray-800/40">
                            <td className="py-3 px-4">{row.studentName}</td>
                            <td className="py-3 px-4">{row.studentId}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(row.usedAt)}</td>
                            <td className="py-3 px-4 capitalize">{row.type}</td>
                            <td className="py-3 px-4 text-xs font-mono">{row.tokenValue?.slice(-8) || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {usageRows.map((row) => (
                      <div
                        key={`${row.id}-mobile`}
                        className="bg-white/10 dark:bg-gray-800/70 border border-white/10 dark:border-gray-800 rounded-2xl p-4 text-sm text-white shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <p className="text-base font-semibold">{row.studentName}</p>
                            <p className="text-xs text-white/70">ID: {row.studentId}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-white/15 text-xs capitalize">
                            {row.type}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-white/80">
                          <p><strong>Scan:</strong> {formatDateTime(row.usedAt)}</p>
                          <p><strong>Token:</strong> {row.tokenValue?.slice(-8) || '--'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityDashboard

