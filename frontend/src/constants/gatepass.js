const PASS_STAGES = {
  CLASS_INCHARGE: 'class_incharge',
  HOD: 'hod',
  DEAN: 'dean',
  VC: 'vc',
  WARDEN: 'warden',
  COMPLETED: 'completed',
}

const PASS_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
}

const PASS_ACTIONS = {
  APPROVED: 'approved',
  FORWARDED: 'forwarded',
  REJECTED: 'rejected',
}

const PASS_STAGE_SEQUENCE = [
  PASS_STAGES.CLASS_INCHARGE,
  PASS_STAGES.HOD,
  PASS_STAGES.DEAN,
  PASS_STAGES.VC,
]

const DISPLAY_STAGE_SEQUENCE = [
  PASS_STAGES.CLASS_INCHARGE,
  PASS_STAGES.HOD,
  PASS_STAGES.DEAN,
  PASS_STAGES.VC,
  PASS_STAGES.WARDEN,
  PASS_STAGES.COMPLETED,
]

const STAGE_LABELS = {
  [PASS_STAGES.CLASS_INCHARGE]: 'Class Incharge',
  [PASS_STAGES.HOD]: 'HOD',
  [PASS_STAGES.DEAN]: 'Dean',
  [PASS_STAGES.VC]: 'VC',
  [PASS_STAGES.WARDEN]: 'Warden',
  [PASS_STAGES.COMPLETED]: 'Completed',
}

const ROLE_TO_STAGE = {
  student: null,
  teacher: PASS_STAGES.CLASS_INCHARGE,
  class_incharge: PASS_STAGES.CLASS_INCHARGE,
  classincharge: PASS_STAGES.CLASS_INCHARGE,
  hod: PASS_STAGES.HOD,
  dean: PASS_STAGES.DEAN,
  vc: PASS_STAGES.VC,
  warden: PASS_STAGES.WARDEN,
  security: null,
}

const getNextStage = (currentStage) => {
  if (!currentStage) return null
  if (currentStage === PASS_STAGES.WARDEN || currentStage === PASS_STAGES.COMPLETED) {
    return null
  }

  const currentIndex = PASS_STAGE_SEQUENCE.indexOf(currentStage)
  if (currentIndex === -1) {
    return null
  }

  return PASS_STAGE_SEQUENCE[currentIndex + 1] || null
}

export {
  PASS_STAGES,
  PASS_STATUS,
  PASS_ACTIONS,
  PASS_STAGE_SEQUENCE,
  DISPLAY_STAGE_SEQUENCE,
  STAGE_LABELS,
  ROLE_TO_STAGE,
  getNextStage,
}
