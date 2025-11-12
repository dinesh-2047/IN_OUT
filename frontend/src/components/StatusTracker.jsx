import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DISPLAY_STAGE_SEQUENCE,
  PASS_ACTIONS,
  PASS_STATUS,
  PASS_STAGES,
  STAGE_LABELS,
} from '../constants/gatepass'

const stageIcons = {
  [PASS_STAGES.CLASS_INCHARGE]: '📋',
  [PASS_STAGES.HOD]: '🏫',
  [PASS_STAGES.DEAN]: '🎓',
  [PASS_STAGES.VC]: '🏛️',
  [PASS_STAGES.WARDEN]: '👮',
  [PASS_STAGES.COMPLETED]: '✅',
}

function StatusTracker({ status, currentStage, history = [] }) {
  const normalizedStatus = status?.toLowerCase?.() || PASS_STATUS.PENDING
  const normalizedStage = currentStage?.toLowerCase?.() || DISPLAY_STAGE_SEQUENCE[0]

  const resolvedStage = useMemo(() => {
    if (normalizedStatus === PASS_STATUS.APPROVED) {
      return PASS_STAGES.COMPLETED
    }

    if (normalizedStatus === PASS_STATUS.REJECTED && history.length > 0) {
      const lastEntryStage = history[history.length - 1]?.stage
      if (DISPLAY_STAGE_SEQUENCE.includes(lastEntryStage)) {
        return lastEntryStage
      }
    }

    if (DISPLAY_STAGE_SEQUENCE.includes(normalizedStage)) {
      return normalizedStage
    }

    return DISPLAY_STAGE_SEQUENCE[0]
  }, [normalizedStage, normalizedStatus, history])

  const activeIndex = Math.max(DISPLAY_STAGE_SEQUENCE.indexOf(resolvedStage), 0)
  const isRejected = normalizedStatus === PASS_STATUS.REJECTED
  const progressRatio = Math.min(activeIndex / Math.max(DISPLAY_STAGE_SEQUENCE.length - 1, 1), 1)

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
          {!isRejected && (
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          )}
        </div>

        {DISPLAY_STAGE_SEQUENCE.map((stage, index) => {
          const isActive = index <= activeIndex && !isRejected
          const isCurrent = index === activeIndex && !isRejected
          const label = STAGE_LABELS[stage] || stage
          const icon = stageIcons[stage] || '•'

          return (
            <div key={stage} className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 text-white shadow-lg scale-110'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                } ${isCurrent ? 'ring-4 ring-indigo-300 dark:ring-indigo-600' : ''}`}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
              >
                {icon}
              </motion.div>
              <p className={`mt-2 text-xs md:text-sm font-medium text-center ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {label}
              </p>
            </div>
          )
        })}
      </div>

      {isRejected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            <span>❌</span>
            <span className="font-semibold">Application Rejected</span>
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="mt-6 bg-white/10 border border-white/20 rounded-lg p-3 md:p-4 text-xs md:text-sm text-white/80 space-y-2">
          <p className="font-semibold text-white">Action Timeline</p>
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {history.map((entry, index) => {
              const entryStage = STAGE_LABELS[entry.stage] || entry.stage
              const entryDate = entry.actedAt ? new Date(entry.actedAt) : null
              const timestamp = entryDate
                ? `${entryDate.toLocaleDateString()} ${entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : '--'
              const actionText = entry.action || ''
              const actionLabel = actionText === PASS_ACTIONS.FORWARDED
                ? 'Forwarded'
                : actionText.charAt(0).toUpperCase() + actionText.slice(1)
              return (
                <li key={`${entry.stage}-${index}`} className="flex flex-col">
                  <span>
                    <strong>{entryStage}:</strong> {actionLabel}
                    {entry.forwardedTo
                      ? ` → ${STAGE_LABELS[entry.forwardedTo] || entry.forwardedTo}`
                      : ''}
                  </span>
                  {entry.remarks && <span className="text-white/60">Remarks: {entry.remarks}</span>}
                  <span className="text-white/50">{timestamp}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default StatusTracker




