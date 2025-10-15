import mongoose from "mongoose";

const drugSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true },
  drugName: String,
  manufacturer: String, // just store name
  manufactureDate: String,
  expiryDate: String,
  distributor: String,
  status: { type: String, default: "registered" }
}, { timestamps: true });

const Drug = mongoose.model("Drug", drugSchema);

export default Drug;
