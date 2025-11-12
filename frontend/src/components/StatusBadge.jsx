import React, { useMemo } from 'react'
import { PASS_STATUS, STAGE_LABELS } from '../constants/gatepass'

const statusStyles = {
  [PASS_STATUS.APPROVED]: 'bg-green-100 text-green-800 border-green-300',
  [PASS_STATUS.REJECTED]: 'bg-red-100 text-red-800 border-red-300',
  [PASS_STATUS.CANCELLED]: 'bg-slate-200 text-slate-800 border-slate-300',
  [PASS_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
}

const statusLabels = {
  [PASS_STATUS.APPROVED]: 'Approved',
  [PASS_STATUS.REJECTED]: 'Rejected',
  [PASS_STATUS.CANCELLED]: 'Cancelled',
  [PASS_STATUS.PENDING]: 'Pending',
}

function StatusBadge({ status, currentStage }) {
  const normalizedStatus = status?.toLowerCase?.() || ''

  const badgeClass = statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-800 border-gray-300'

  const label = statusLabels[normalizedStatus] || 'Unknown'

  const suffix = useMemo(() => {
    if (normalizedStatus !== PASS_STATUS.PENDING) return ''
    if (!currentStage) return ''
    const readableStage = STAGE_LABELS[currentStage] || currentStage
    return readableStage ? ` · ${readableStage}` : ''
  }, [normalizedStatus, currentStage])

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
      {label}
      {suffix}
    </span>
  )
}

export default StatusBadge





