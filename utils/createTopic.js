import * as hedera from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const { Client, PrivateKey, TopicCreateTransaction, Hbar } = hedera;

async function main() {
  try {
    const client = Client.forTestnet();
    client.setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      PrivateKey.fromStringED25519(process.env.HEDERA_PRIVATE_KEY)
    );

    client.setDefaultMaxTransactionFee(new Hbar(2));

    const tx = new TopicCreateTransaction()
      .setTopicMemo("Pharma Company Verification")
      .freezeWith(client);

    const signedTx = await tx.sign(
      PrivateKey.fromStringED25519(process.env.HEDERA_PRIVATE_KEY)
    );

    const submitTx = await signedTx.execute(client);
    const receipt = await submitTx.getReceipt(client);

    console.log("✅ Topic created successfully!");
    console.log("🆔 Topic ID:", receipt.topicId.toString());
  } catch (error) {
    console.error("❌ Error creating topic:", error);
  }
}

main();
