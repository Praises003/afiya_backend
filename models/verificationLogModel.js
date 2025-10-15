import mongoose from "mongoose";

const verificationLogSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true },
  verified: { type: Boolean, required: true },
  location: { type: String },
  deviceInfo: { type: String },
  trustScore: { type: Number },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const VerificationLog = mongoose.model("VerificationLog", verificationLogSchema);

export default VerificationLog;
