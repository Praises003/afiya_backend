import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const TOPIC_ID = process.env.TOPIC_ID;

// Helper function to query Hedera mirror node
const verifyBatchHedera = async (batchId) => {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?limit=50`;

  try {
    const response = await axios.get(url);

    for (const msg of response.data.messages) {
      const text = Buffer.from(msg.message, "base64").toString("utf8");
      let decoded;

      try {
        decoded = JSON.parse(text); // only parse JSON messages
      } catch (err) {
        continue; // skip non-JSON (like "Hello from Afiya!")
      }

      if (decoded.batchId === batchId) {
        return decoded;
      }
    }

    return null;
  } catch (error) {
    console.error("Error querying Hedera Mirror Node:", error.message);
    throw error;
  }
};


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



// 1️⃣ Internal helper — callable from WhatsApp controller
export async function verifyBatchId(batchId) {
  try {
    const result = await verifyBatchHedera(batchId);
    return result; // { success, found, data }
  } catch (error) {
    console.error("Hedera verification error:", error);
    return { success: false, found: false };
  }
}

// 2️⃣ Route handler — Express version
export async function verifyBatch(req, res) {
  try {
    const { batchId } = req.body; // ✅ from POST body, not params
    const result = await verifyBatchHedera(batchId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error verifying batch:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
}
