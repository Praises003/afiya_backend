import {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey
} from "@hashgraph/sdk";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const client = Client.forTestnet();

const privateKey = PrivateKey.fromStringED25519(process.env.HEDERA_PRIVATE_KEY);
client.setOperator(process.env.HEDERA_ACCOUNT_ID, privateKey);

export const publishMessage = async (payload) => {
  try {
    const message = JSON.stringify(payload)
    const tx = await new TopicMessageSubmitTransaction({
      topicId: process.env.TOPIC_ID,
      message: message
    })
      .freezeWith(client) // 🔥 this line fixes the error
      .sign(privateKey);  // or .signWithOperator(client)

    const submitResponse = await tx.execute(client);
    const receipt = await submitResponse.getReceipt(client);

    console.log("✅ Message submitted! Status:", receipt.status.toString());
    return receipt;
  } catch (error) {
    console.error("❌ Error publishing message:", error);
    throw error;
  }
};


export const publishVerifiedCompany = async (companyData) => {
  try {
    const message = JSON.stringify({
      type: "Pharma Company Verification",
      companyName: companyData.name,
      licenseNumber: companyData.licenseNumber,
      address: companyData.address,
      email: companyData.email || null,
      verifiedAt: new Date().toISOString(),
    });

    const tx = await new TopicMessageSubmitTransaction({
      topicId: process.env.PHARMA_TOPIC_ID,
      message,
    })
      .freezeWith(client)
      .sign(privateKey);

    const submitResponse = await tx.execute(client);
    const receipt = await submitResponse.getReceipt(client);

    console.log("✅ Company verification submitted!");
    console.log("🆔 Topic ID:", process.env.PHARMA_TOPIC_ID);
    console.log("📜 Transaction Status:", receipt.status.toString());

    return receipt;
  } catch (error) {
    console.error("❌ Error publishing company verification:", error);
    throw error;
  }
};






// Helper function to query Hedera mirror node
const TOPIC_ID = process.env.TOPIC_ID;
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