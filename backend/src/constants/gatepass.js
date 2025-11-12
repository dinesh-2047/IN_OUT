const PASS_STAGES = {
  CLASS_INCHARGE: "class_incharge",
  HOD: "hod",
  DEAN: "dean",
  VC: "vc",
  WARDEN: "warden",
  COMPLETED: "completed",
};

const PASS_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

const PASS_ACTIONS = {
  APPROVED: "approved",
  FORWARDED: "forwarded",
  REJECTED: "rejected",
};

const PASS_STAGE_SEQUENCE = [
  PASS_STAGES.CLASS_INCHARGE,
  PASS_STAGES.HOD,
  PASS_STAGES.DEAN,
  PASS_STAGES.VC,
];

const STAGE_ROLE_MAP = {
  [PASS_STAGES.CLASS_INCHARGE]: ["teacher", "class_incharge", "classincharge"],
  [PASS_STAGES.HOD]: ["hod"],
  [PASS_STAGES.DEAN]: ["dean"],
  [PASS_STAGES.VC]: ["vc"],
  [PASS_STAGES.WARDEN]: ["warden"],
  [PASS_STAGES.COMPLETED]: [],
};

export { PASS_STAGES, PASS_STATUS, PASS_ACTIONS, PASS_STAGE_SEQUENCE, STAGE_ROLE_MAP };
