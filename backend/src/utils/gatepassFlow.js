import crypto from "crypto";
import {
  PASS_STAGES,
  PASS_STAGE_SEQUENCE,
  STAGE_ROLE_MAP,
} from "../constants/gatepass.js";

const WORK_START_HOUR = 9; // 9 AM
const WORK_END_HOUR = 16; // 4 PM

const isWorkingDay = (date) => {
  const day = date.getDay();
  return day >= 1 && day <= 5;
};

const isWithinWorkingHours = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  if (hours < WORK_START_HOUR || hours > WORK_END_HOUR) {
    return false;
  }

  if (hours === WORK_END_HOUR && minutes > 0) {
    return false;
  }

  return true;
};

const determineInitialStage = (outTime) => {
  const dateObj = outTime instanceof Date ? outTime : new Date(outTime);

  if (!Number.isFinite(dateObj.getTime())) {
    throw new Error("Invalid outTime provided for gate pass request");
  }

  if (!isWorkingDay(dateObj) || !isWithinWorkingHours(dateObj)) {
    return PASS_STAGES.WARDEN;
  }

  return PASS_STAGES.CLASS_INCHARGE;
};

const determineNextStage = (currentStage) => {
  if (currentStage === PASS_STAGES.WARDEN || currentStage === PASS_STAGES.COMPLETED) {
    return null;
  }

  const sequenceIndex = PASS_STAGE_SEQUENCE.indexOf(currentStage);

  if (sequenceIndex === -1) {
    return null;
  }

  return PASS_STAGE_SEQUENCE[sequenceIndex + 1] || null;
};

const canUserActOnStage = (role, stage) => {
  const allowedRoles = STAGE_ROLE_MAP[stage] || [];
  return allowedRoles.includes(role);
};

const generateGatePassKey = () => crypto.randomBytes(12).toString("hex");

export {
  determineInitialStage,
  determineNextStage,
  canUserActOnStage,
  generateGatePassKey,
};
