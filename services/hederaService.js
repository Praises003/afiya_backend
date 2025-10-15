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
