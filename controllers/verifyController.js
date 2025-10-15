// import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();

// const TOPIC_ID = process.env.TOPIC_ID;

// // Helper function to query Hedera mirror node
// const verifyBatchHedera = async (batchId) => {
//   const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?limit=50`;

//   try {
//     const response = await axios.get(url);

//     for (const msg of response.data.messages) {
//       const text = Buffer.from(msg.message, "base64").toString("utf8");
//       let decoded;

//       try {
//         decoded = JSON.parse(text); // only parse JSON messages
//       } catch (err) {
//         continue; // skip non-JSON (like "Hello from Afiya!")
//       }

//       if (decoded.batchId === batchId) {
//         return decoded;
//       }
//     }

//     return null;
//   } catch (error) {
//     console.error("Error querying Hedera Mirror Node:", error.message);
//     throw error;
//   }
// };


// // Controller
// export const verifyBatch = async (req, res) => {
//   try {
//     const { batchId } = req.params;

//     const batchData = await verifyBatchHedera(batchId);

//     if (!batchData) {
//       return res.status(404).json({
//         success: false,
//         found: false,
//         message: "Batch not found on Hedera"
//       });
//     }

//     return res.json({
//       success: true,
//       found: true,
//       data: batchData
//     });
//   } catch (error) {
//     console.error("Hedera verification error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };



// controllers/verifyController.js
import { verifyBatchHedera } from "../services/hederaService.js";

// ✅ Internal helper for other controllers (like WhatsApp)
export async function verifyBatchId(batchId) {
  try {
    const result = await verifyBatchHedera(batchId);
    return result; // { success, found, data }
  } catch (error) {
    console.error("Error verifying batch:", error);
    return { success: false, found: false };
  }
}

// ✅ Express route for /api/verify endpoint
export async function verifyBatch(req, res) {
  try {
    const { batchId } = req.body; // only for API
    if (!batchId) {
      return res.status(400).json({ success: false, message: "batchId is required" });
    }

    const result = await verifyBatchHedera(batchId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error verifying batch:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
}
