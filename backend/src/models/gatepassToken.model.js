import mongoose from "mongoose";

const { Schema } = mongoose;

const usageLogSchema = new Schema(
  {
    usedAt: {
      type: Date,
      default: Date.now,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["exit", "entry", "scan"],
      default: "scan",
    },
  },
  { _id: false }
);

const gatePassTokenSchema = new Schema(
  {
    request: {
      type: Schema.Types.ObjectId,
      ref: "GatePassRequest",
      required: true,
      unique: true,
    },
    value: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    usesAllowed: {
      type: Number,
      default: 2,
      min: 1,
    },
    usesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "used", "revoked"],
      default: "active",
    },
    expiresAt: {
      type: Date,
    },
    usageLog: {
      type: [usageLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const GatePassToken = mongoose.model("GatePassToken", gatePassTokenSchema);

export { GatePassToken };
