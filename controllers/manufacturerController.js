import Manufacturer from "../models/manufacturerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { publishVerifiedCompany } from "../services/hederaService.js"; // make sure this is set up

/**
 * @desc Register and verify a new pharmaceutical manufacturer
 * @route POST /api/manufacturers/register
 * @access Public (or Admin only, depending on your flow)
 */
export const registerManufacturer = async (req, res) => {
  try {
    const { name, licenseNumber, email, address, password } = req.body;

    // 1️⃣ Check if manufacturer already exists
    const existing = await Manufacturer.findOne({ licenseNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: "Manufacturer already registered." });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Save to MongoDB (unverified for now)
    const manufacturer = await Manufacturer.create({
      name,
      licenseNumber,
      email,
      address,
      password: hashedPassword,
      verified: true, // you can set this to false until manually approved
    });

    // 4️⃣ Publish verification data to Hedera Consensus Service
    await publishVerifiedCompany({
      name,
      licenseNumber,
      address,
      email,
    });

    console.log(`✅ Manufacturer ${name} verified and recorded on Hedera.`);

    res.status(201).json({
      success: true,
      message: "Manufacturer registered and verified on Hedera.",
      data: {
        id: manufacturer._id,
        name: manufacturer.name,
        licenseNumber: manufacturer.licenseNumber,
        verified: manufacturer.verified,
      },
    });
  } catch (error) {
    console.error("❌ Error registering manufacturer:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc Get all manufacturers
 * @route GET /api/manufacturers
 */
export const getManufacturers = async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: manufacturers });
  } catch (error) {
    console.error("❌ Error fetching manufacturers:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// LOGIN MANUFACTURER
export const loginManufacturer = async (req, res) => {
  try {
    const { licenseNumber, password } = req.body;

    const manufacturer = await Manufacturer.findOne({ licenseNumber });
    if (!manufacturer)
      return res.status(404).json({ success: false, message: "Manufacturer not found" });

    const validPassword = await bcrypt.compare(password, manufacturer.password);
    if (!validPassword)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: manufacturer._id, licenseNumber: manufacturer.licenseNumber },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: manufacturer._id,
        name: manufacturer.name,
        verified: manufacturer.verified,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
