import {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey
} from "@hashgraph/sdk";
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





const TOPIC_ID = process.env.TOPIC_ID;

// Helper function to query Hedera mirror node
export const verifyBatchHedera = async (batchId) => {
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