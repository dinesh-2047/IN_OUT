import mongoose from "mongoose";
import { GatePassRequest } from "../models/gatepassRequest.model.js";
import { GatePassToken } from "../models/gatepassToken.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  determineInitialStage,
  determineNextStage,
  canUserActOnStage,
  generateGatePassKey,
} from "../utils/gatepassFlow.js";
import { PASS_ACTIONS, PASS_STATUS, PASS_STAGES } from "../constants/gatepass.js";

const roleToStageMap = {
  teacher: PASS_STAGES.CLASS_INCHARGE,
  class_incharge: PASS_STAGES.CLASS_INCHARGE,
  classincharge: PASS_STAGES.CLASS_INCHARGE,
  hod: PASS_STAGES.HOD,
  dean: PASS_STAGES.DEAN,
  vc: PASS_STAGES.VC,
  warden: PASS_STAGES.WARDEN,
};

const ensureStudentRole = (user) => {
  if (user?.role !== "student") {
    throw new ApiError(403, "Only students can apply for gate pass requests");
  }
};

const ensureApproverRole = (user, stage) => {
  if (!canUserActOnStage(user?.role, stage)) {
    throw new ApiError(403, "You are not authorized to act on this gate pass");
  }
};

const ensureSecurityRole = (user) => {
  if (!user || !["security", "warden"].includes(user.role)) {
    throw new ApiError(403, "Only security staff can validate gate passes");
  }
};

const parseDateField = (value, field) => {
  const parsed = new Date(value);

  if (!value || Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Invalid or missing ${field}`);
  }

  return parsed;
};

const issueGatePassToken = async (requestId, expectedReturnTime) => {
  let uniqueKey = generateGatePassKey();
  let collision = await GatePassToken.exists({ value: uniqueKey });

  while (collision) {
    uniqueKey = generateGatePassKey();
    collision = await GatePassToken.exists({ value: uniqueKey });
  }

  const tokenDoc = await GatePassToken.create({
    request: requestId,
    value: uniqueKey,
    usesAllowed: 2,
    usesCount: 0,
    expiresAt: expectedReturnTime,
  });

  return tokenDoc;
};

const createGatePassRequest = asyncHandler(async (req, res) => {
  ensureStudentRole(req.user);

  const { reason, destination, outTime, expectedReturnTime } = req.body || {};

  if (!reason || !destination) {
    throw new ApiError(400, "Reason and destination are required");
  }

  const parsedOutTime = parseDateField(outTime, "outTime");
  const parsedReturnTime = parseDateField(expectedReturnTime, "expectedReturnTime");

  if (parsedReturnTime <= parsedOutTime) {
    throw new ApiError(400, "Expected return time must be after out time");
  }

  const initialStage = determineInitialStage(parsedOutTime);

  const requestDoc = await GatePassRequest.create({
    student: req.user._id,
    reason,
    destination,
    outTime: parsedOutTime,
    expectedReturnTime: parsedReturnTime,
    status: PASS_STATUS.PENDING,
    currentStage: initialStage,
  });

  const populatedRequest = await requestDoc.populate("student", "fullName username role studentId");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedRequest, "Gate pass request submitted"));
});

const listGatePassRequests = asyncHandler(async (req, res) => {
  const { status, stage, studentId } = req.query || {};

  const filters = {};

  const assignedStage = roleToStageMap[req.user.role];

  if (req.user.role === "student") {
    filters.student = req.user._id;
  } else if (assignedStage) {
    filters.currentStage = assignedStage;
  }

  if (status) {
    const normalizedStatus = status.toLowerCase();

    if (!Object.values(PASS_STATUS).includes(normalizedStatus)) {
      throw new ApiError(400, "Invalid status filter provided");
    }

    filters.status = normalizedStatus;
  }

  if (stage && !assignedStage) {
    const normalizedStage = stage.toLowerCase();

    if (!Object.values(PASS_STAGES).includes(normalizedStage)) {
      throw new ApiError(400, "Invalid stage filter provided");
    }

    filters.currentStage = normalizedStage;
  }

  if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
    if (
      req.user.role === "student" &&
      studentId !== req.user._id.toString()
    ) {
      throw new ApiError(403, "Students can only view their own requests");
    }

    filters.student = studentId;
  }

  const requests = await GatePassRequest.find(filters)
    .populate("student", "fullName username role studentId")
    .populate("gatePassToken")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, requests, "Gate pass requests fetched"));
});

const getGatePassRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid gate pass request id");
  }

  const request = await GatePassRequest.findById(id)
    .populate("student", "fullName username role studentId")
    .populate("gatePassToken");

  if (!request) {
    throw new ApiError(404, "Gate pass request not found");
  }

  if (
    req.user.role === "student" &&
    request.student._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not allowed to view this gate pass request");
  }

  if (req.user.role !== "student" && !canUserActOnStage(req.user.role, request.currentStage)) {
    const isPartOfHistory = request.history.some(
      (entry) => entry.actedBy.toString() === req.user._id.toString()
    );

    if (!isPartOfHistory && req.user.role !== "warden" && req.user.role !== "security") {
      throw new ApiError(403, "You are not allowed to view this gate pass request");
    }
  }

  return res.status(200).json(new ApiResponse(200, request, "Gate pass request fetched"));
});

const decideGatePassRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, remarks } = req.body || {};
  const normalizedAction = action?.toLowerCase();

  if (!normalizedAction) {
    throw new ApiError(400, "Action is required to process the gate pass request");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid gate pass request id");
  }

  const request = await GatePassRequest.findById(id).populate("gatePassToken");

  if (!request) {
    throw new ApiError(404, "Gate pass request not found");
  }

  if (request.status !== PASS_STATUS.PENDING) {
    throw new ApiError(400, "Gate pass request is no longer pending");
  }

  ensureApproverRole(req.user, request.currentStage);

  if (normalizedAction === "forward") {
    const nextStage = determineNextStage(request.currentStage);

    if (!nextStage) {
      throw new ApiError(400, "This request cannot be forwarded further");
    }

    request.history.push({
      stage: request.currentStage,
      action: PASS_ACTIONS.FORWARDED,
      actedBy: req.user._id,
      remarks,
      forwardedTo: nextStage,
    });

    request.currentStage = nextStage;
    request.lastActionAt = new Date();

    await request.save();

    return res
      .status(200)
      .json(new ApiResponse(200, request, "Gate pass request forwarded"));
  }

  if (normalizedAction === "approve") {
    if (request.gatePassToken) {
      throw new ApiError(400, "Gate pass token already issued for this request");
    }

    const tokenDoc = await issueGatePassToken(request._id, request.expectedReturnTime);

    request.history.push({
      stage: request.currentStage,
      action: PASS_ACTIONS.APPROVED,
      actedBy: req.user._id,
      remarks,
    });

    request.status = PASS_STATUS.APPROVED;
    request.currentStage = PASS_STAGES.COMPLETED;
    request.gatePassToken = tokenDoc._id;
    request.lastActionAt = new Date();

    await request.save();

    const populatedRequest = await GatePassRequest.findById(request._id)
      .populate("student", "fullName username role studentId")
      .populate("gatePassToken");

    return res
      .status(200)
      .json(
        new ApiResponse(200, populatedRequest, "Gate pass request approved and token generated")
      );
  }

  throw new ApiError(400, "Unsupported action for gate pass request");
});

const scanGatePassToken = asyncHandler(async (req, res) => {
  ensureSecurityRole(req.user);

  const { key } = req.body || {};

  if (!key) {
    throw new ApiError(400, "Gate pass key is required");
  }

  const tokenDoc = await GatePassToken.findOne({ value: key }).populate({
    path: "request",
    populate: {
      path: "student",
      select: "fullName username studentId",
    },
  });

  if (!tokenDoc) {
    throw new ApiError(404, "Gate pass token not found");
  }

  if (tokenDoc.status !== "active") {
    throw new ApiError(410, "Gate pass token is no longer active");
  }

  if (tokenDoc.expiresAt && tokenDoc.expiresAt < new Date()) {
    tokenDoc.status = "revoked";
    await tokenDoc.save({ validateBeforeSave: false });
    throw new ApiError(410, "Gate pass token has expired");
  }

  if (!tokenDoc.request || tokenDoc.request.status !== PASS_STATUS.APPROVED) {
    throw new ApiError(400, "Associated gate pass request is not approved");
  }

  if (tokenDoc.usesCount >= tokenDoc.usesAllowed) {
    tokenDoc.status = "used";
    await tokenDoc.save({ validateBeforeSave: false });
    throw new ApiError(410, "Gate pass token has already been used");
  }

  const usageType = tokenDoc.usesCount === 0 ? "exit" : "entry";

  tokenDoc.usesCount += 1;
  tokenDoc.usageLog.push({ usedAt: new Date(), usedBy: req.user._id, type: usageType });

  if (tokenDoc.usesCount >= tokenDoc.usesAllowed) {
    tokenDoc.status = "used";
  }

  await tokenDoc.save({ validateBeforeSave: false });

  const remainingUses = Math.max(tokenDoc.usesAllowed - tokenDoc.usesCount, 0);
  const responseMessage = remainingUses === 0 ? "Gate pass fully utilized" : "Gate pass validated";

  return res
    .status(200)
    .json(new ApiResponse(200, { token: tokenDoc, remainingUses }, responseMessage));
});

export {
  createGatePassRequest,
  listGatePassRequests,
  getGatePassRequestById,
  decideGatePassRequest,
  scanGatePassToken,
};
