import mongoose from "mongoose";
import { PASS_STAGES, PASS_STATUS, PASS_ACTIONS } from "../constants/gatepass.js";

const { Schema } = mongoose;

const decisionSchema = new Schema(
  {
    stage: {
      type: String,
      enum: Object.values(PASS_STAGES),
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(PASS_ACTIONS),
      required: true,
    },
    actedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    forwardedTo: {
      type: String,
      enum: Object.values(PASS_STAGES),
    },
    actedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const gatePassRequestSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    outTime: {
      type: Date,
      required: true,
    },
    expectedReturnTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PASS_STATUS),
      default: PASS_STATUS.PENDING,
    },
    currentStage: {
      type: String,
      enum: Object.values(PASS_STAGES),
      required: true,
    },
    history: {
      type: [decisionSchema],
      default: [],
    },
    gatePassToken: {
      type: Schema.Types.ObjectId,
      ref: "GatePassToken",
    },
    lastActionAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const GatePassRequest = mongoose.model("GatePassRequest", gatePassRequestSchema);

export { GatePassRequest };
