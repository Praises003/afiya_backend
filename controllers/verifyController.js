import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const TOPIC_ID = process.env.HEDERA_TOPIC_ID;

// Verify a drug batch on Hedera
export const verifyBatchHedera = async (batchId) => {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?limit=50`;

  try {
    const response = await axios.get(url);

    for (const msg of response.data.messages) {
      const text = Buffer.from(msg.message, "base64").toString("utf8");
      let json;

      try {
        json = JSON.parse(text); // Only parse JSON messages
      } catch (err) {
        continue; // Skip non-JSON messages like "Hello from Afiya!"
      }

      // Match the batchId from Hedera message
      if (json.batchId === batchId) {
        return {
          success: true,
          found: true,
          data: {
            batchId: json.batchId,
            drugName: json.drugName,
            manufacturer: json.manufacturer,
            expiryDate: json.expiryDate,
          },
        };
      }
    }

    // If loop completes without finding batchId
    return { success: true, found: false, data: null };
  } catch (error) {
    console.error("Error verifying batch on Hedera:", error);
    return { success: false, found: false, data: null };
  }
};



// Controller
export const verifyBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batchData = await verifyBatchHedera(batchId);

    if (!batchData) {
      return res.status(404).json({
        success: false,
        found: false,
        message: "Batch not found on Hedera"
      });
    }

    return res.json({
      success: true,
      found: true,
      data: batchData
    });
  } catch (error) {
    console.error("Hedera verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};




const MANUFACTURER_TOPIC_ID = process.env.PHARMA_TOPIC_ID || "0.0.7061841"; 
/**
 * Verify a manufacturer exists on the Hedera manufacturer topic.
 * @param {string} query - company name or license number to search for
 * @returns {Promise<{success: boolean, found: boolean, data: object|null}>}
 */
export const verifyManufacturerHedera = async (query) => {
  if (!MANUFACTURER_TOPIC_ID) {
    console.error("MANUFACTURER_TOPIC_ID is not set in environment");
    return { success: false, found: false, data: null };
  }

  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${MANUFACTURER_TOPIC_ID}/messages?limit=100`;

  try {
    const resp = await axios.get(url);
    const messages = resp.data?.messages || [];

    const normalizedQuery = String(query).trim().toLowerCase();

    for (const msg of messages) {
      // decode base64 message payload
      const text = Buffer.from(msg.message, "base64").toString("utf8");

      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        // not JSON — skip
        continue;
      }

      // Normalise fields for comparison
      const name = (json.name || json.companyName || json.company || "").toString().toLowerCase();
      const license = (json.licenseNumber || json.license || json.licenseNo || "").toString().toLowerCase();

      // Match either full license (exact) or name (contains)
      if (license && license === normalizedQuery) {
        return { success: true, found: true, data: json };
      }

      if (name && name.includes(normalizedQuery)) {
        return { success: true, found: true, data: json };
      }
    }

    // Not found
    return { success: true, found: false, data: null };
  } catch (error) {
    console.error("❌ Error verifying manufacturer on Hedera:", error.message || error);
    return { success: false, found: false, data: null };
  }
};




