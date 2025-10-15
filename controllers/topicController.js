import Drug from "../models/drugModel.js";
import { publishMessage } from "../services/hederaService.js";

export const registerDrug = async (req, res) => {
  try {
    const { batchNumber, drugName, manufacturer, manufactureDate, expiryDate, distributor } = req.body;

    // 1️⃣ Save batch in DB
    const newDrug = await Drug.create({
      batchNumber,
      drugName,
      manufacturer,
      manufactureDate,
      expiryDate,
      distributor,
      status: "registered"
    });

    // 2️⃣ Prepare payload for Hedera
    const hederaPayload = {
      batchId: batchNumber,
      drugName,
      manufacturer,
      expiryDate
    };

    // 3️⃣ Publish to Hedera
    const hederaReceipt = await publishMessage(hederaPayload);
    

    // 4️⃣ Return success
    return res.status(201).json({
      success: true,
      drug: newDrug,
      hedera: {
        status: hederaReceipt.status,
        consensusTimestamp: hederaReceipt.consensusTimestamp
      }
    });

  } catch (error) {
    console.error("Error registering drug:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
