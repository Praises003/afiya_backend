import mongoose from "mongoose";

const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  email: { type: String },
  address: { type: String },
  password: { type: String, required: true }, 
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const Manufacturer = mongoose.model("Manufacturer", manufacturerSchema);

export default Manufacturer;
