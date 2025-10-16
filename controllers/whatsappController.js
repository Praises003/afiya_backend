// import axios from "axios";
// import Tesseract from "tesseract.js";
// import { verifyBatch } from "./verifyController.js"; // if using internal function
// import { verifyBatchHedera, verifyManufacturerHedera } from "../services/hederaService.js"; // if using service function
// import twilio from "twilio";

// // WhatsApp Webhook Controller
// export const whatsappWebhook = async (req, res) => {
//   try {
//     const message = req.body.Body?.trim(); 
//     const from = req.body.From;
//     const mediaUrl = req.body.MediaUrl0; 

//     console.log("Incoming message from:", from);
//     console.log(" message :", message);

//     let reply = "";
//     // ✅ Handle manufacturer verification
//     if (/verify company|check manufacturer/i.test(message)) {
//       const query = message.replace(/verify company|check manufacturer/gi, "").trim();

//       if (!query) {
//         reply =
//           "Please provide a company name or license number, e.g., 'verify company Emzor'.";
//       } else {
//         const result = await verifyManufacturerHedera(query);

//         if (!result.success) {
//           reply = "❌ Error checking Hedera network. Please try again later.";
//         } else if (!result.found) {
//           reply = `❌ No verified record found for "${query}". The company may not be registered on Hedera.`;
//         } else {
//           const m = result.data;
//           reply = `✅ Verified Manufacturer\n🏭 *${m.name}*\n📜 License: ${m.licenseNumber}\n📧 ${m.email || "N/A"}\n📍 ${m.address || "N/A"}\n\nRecorded immutably on Hedera 🌍`;
//         }
//       }
//     }

//     if (mediaUrl) {
//       // Case: user sent an image → Perform OCR
//       console.log("Received image:", mediaUrl);
//       reply = await processImage(mediaUrl);
//     } else if (message) {
//       // Case: user sent a text → Treat it as batch ID
//       const result = await verifyBatchHedera(message);

//       if (!result.success) {
//         reply = "⚠️ Error verifying batch on Hedera. Please try again.";
//       } else if (!result.found) {
//         reply = `❌ No record found for batch ID *${message}* on Hedera.`;
//       } else {
//         const data = result.data;
//         reply = `✅ *Batch Verified!*\n\n📦 Batch ID: ${data.batchId}\n💊 Drug: ${data.drugName}\n🏭 Manufacturer: ${data.manufacturer}\n⏳ Expiry Date: ${data.expiryDate}`;
//       }
//     } else {
//       reply = "👋 Hello! Please send a *photo* or *batch ID* to verify authenticity.";
//     }

//     // Prevent sending empty replies
//     if (!reply || reply.trim() === "") {
//       reply = "⚠️ Could not process your request. Please try again.";
//     }

//     // Send the reply back to WhatsApp via Twilio
//     await sendWhatsAppMessage(from, reply);

//     res.status(200).send("OK");
//   } catch (error) {
//     console.error("Error in WhatsApp webhook:", error);
//     res.status(500).send("Error processing WhatsApp message");
//   }
// };
// // ----------------------
// // OCR Function
// // ----------------------


// export async function processImage(mediaUrl) {
//   try {
//     // 1️⃣ Download the image from WhatsApp
//     const { data: imageBuffer } = await axios.get(mediaUrl, {
//       responseType: "arraybuffer",
//       auth: {
//         username: process.env.TWILIO_ACCOUNT_SID,
//       password: process.env.TWILIO_AUTH_TOKEN,
//   },
//     });

//     // 2️⃣ Run OCR
//     const result = await Tesseract.recognize(imageBuffer, "eng");

//     const text = result.data.text;
//     const confidence = result.data.confidence || 0;

//     console.log("OCR confidence:", confidence);
//     console.log("Extracted text:", text);

//     // 3️⃣ If the OCR confidence is too low, prompt user to retake photo
//     if (confidence < 60) {
//       return "⚠️ I couldn’t clearly read the label. Please retake the photo in better lighting.";
//     }

//     // 4️⃣ Clean and normalize OCR text
//     const cleanedText = text.replace(/\s+/g, " ").trim();

//     // 5️⃣ Detect possible batch ID patterns
//     const batchRegex = /\b([A-Z0-9]{2,}-?\d{1,}[A-Z0-9]*)\b/gi;
//     const matches = cleanedText.match(batchRegex);

//     if (matches && matches.length > 0) {
//       const batchId = matches[0].toUpperCase(); // Normalize
//       console.log("Detected batch ID:", batchId);

//       // 6️⃣ Verify via Hedera
//       const verification = await verifyBatchHedera(batchId);

//       // 7️⃣ Generate a user-friendly WhatsApp response
//       if (verification?.success && verification?.found) {
//         const { drugName, manufacturer, expiryDate } = verification.data;
//         return `✅ *Drug Verified*\n\n*Batch ID:* ${batchId}\n*Name:* ${drugName}\n*Manufacturer:* ${manufacturer}\n*Expiry:* ${expiryDate}\n\n✔️ This drug is authentic.`;
//       } else {
//         return `🚫 *Batch ID:* ${batchId}\n\nNo record found on Hedera. Please confirm the source of this product.`;
//       }
//     } else {
//       return "❌ Could not detect any batch number in the image. Please retake a clear photo of the label or packaging.";
//     }
//   } catch (error) {
//     console.error("OCR/Verification Error:", error);
//     return "⚠️ Something went wrong while reading the image. Please try again later.";
//   }
// }



// // ----------------------
// // Verify Batch (calls backend verify endpoint)
// // ----------------------
// // async function verifyBatch(batchId) {
// //   try {
// //     const { data } = await axios.post("http://localhost:5000/api/verify", { batchId });

// //     if (data.success && data.found) {
// //       const info = data.data;
// //       return `✅ *Authentic Product Verified!*\n\n🧾 Batch ID: ${info.batchId}\n💊 Drug: ${info.drugName}\n🏭 Manufacturer: ${info.manufacturer}\n📅 Expiry: ${info.expiryDate}`;
// //     } else {
// //       return "⚠️ This batch number could not be verified. It may not exist on Hedera.";
// //     }
// //   } catch (error) {
// //     console.error("Verification Error:", error);
// //     return "🚨 Error verifying product. Please try again later.";
// //   }
// // }

// // ----------------------
// // Send Message via Twilio API
// // ----------------------


// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const from = "whatsapp:+14155238886"; // Twilio sandbox number

// const client = twilio(accountSid, authToken);

// export async function sendWhatsAppMessage(to, message) {
//   try {
//     await client.messages.create({
//       from,
//       to,
//       body: message,
//     });
//     console.log(`✅ WhatsApp message sent to ${to}`);
//   } catch (error) {
//     console.error("❌ Error sending WhatsApp message:", error);
//   }
// }






import axios from "axios";
import Tesseract from "tesseract.js";
import twilio from "twilio";
import { verifyBatchHedera,  } from "../services/hederaService.js";
import { verifyManufacturerHedera } from "../controllers/verifyController.js"

// -----------------------------------------
// WhatsApp Webhook Controller
// -----------------------------------------
export const whatsappWebhook = async (req, res) => {
  try {
    const message = req.body.Body?.trim() || "";
    const from = req.body.From;
    const mediaUrl = req.body.MediaUrl0;

    console.log("Incoming message from:", from);
    console.log("Message content:", message);

    let reply = "";

    // 🧠 Command Parser
    const lowerMsg = message.toLowerCase();

    if (mediaUrl) {
      reply = await handleImageVerification(mediaUrl);
    } else if (lowerMsg.startsWith("verify company") || lowerMsg.startsWith("check manufacturer")) {
      reply = await handleCompanyVerification(message);
    } else if (isLikelyBatchId(message)) {
      reply = await handleBatchVerification(message);
    } else if (message.length === 0) {
      reply = "👋 Hello! Please send a *photo* or *batch ID* to verify authenticity.";
    } else {
      reply = helpMenu();
    }

    await sendWhatsAppMessage(from, reply);
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error in WhatsApp webhook:", error);
    res.status(500).send("Error processing WhatsApp message");
  }
};

// -----------------------------------------
// 🏭 Handle Company Verification
// -----------------------------------------
async function handleCompanyVerification(message) {
  const query = message.replace(/verify company|check manufacturer/gi, "").trim();

  if (!query) {
    return "Please provide a company name or license number.\nExample: *verify company Emzor*";
  }

  const result = await verifyManufacturerHedera(query);

  if (!result.success) {
    return "⚠️ Could not reach Hedera network. Try again later.";
  } else if (!result.found) {
    return `❌ No verified record found for *${query}*. This manufacturer may not be registered on Hedera.`;
  } else {
    const m = result.data;
    return `✅ *Verified Manufacturer*\n\n🏭 *${m.companyName}*\n📜 License: ${m.licenseNumber}\n📧 ${m.email || "N/A"}\n📍 ${m.address || "N/A"}\n\nRecorded immutably on Hedera 🌍`;
  }
}

// -----------------------------------------
// 💊 Handle Batch Verification
// -----------------------------------------
async function handleBatchVerification(batchId) {
  const result = await verifyBatchHedera(batchId);

  if (!result.success) {
    return "⚠️ Error verifying batch on Hedera. Please try again.";
  } else if (!result.found) {
    return `❌ No record found for batch ID *${batchId}* on Hedera.`;
  } else {
    const data = result.data;
    return `✅ *Batch Verified!*\n\n📦 Batch ID: ${data.batchId}\n💊 Drug: ${data.drugName}\n🏭 Manufacturer: ${data.manufacturer}\n⏳ Expiry Date: ${data.expiryDate}`;
  }
}

// -----------------------------------------
// 📷 Handle Image (OCR) Verification
// -----------------------------------------
async function handleImageVerification(mediaUrl) {
  try {
    const { data: imageBuffer } = await axios.get(mediaUrl, {
      responseType: "arraybuffer",
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
    });

    const result = await Tesseract.recognize(imageBuffer, "eng");
    const text = result.data.text;
    const confidence = result.data.confidence || 0;

    console.log("OCR confidence:", confidence);
    console.log("Extracted text:", text);

    if (confidence < 60) {
      return "⚠️ I couldn’t clearly read the label. Please retake the photo in better lighting.";
    }

    const cleanedText = text.replace(/\s+/g, " ").trim();
    const batchRegex = /\b([A-Z]{2,}-?\d{2,})\b/g;
    const matches = cleanedText.match(batchRegex);

    if (matches?.length > 0) {
      const batchId = matches[0].toUpperCase();
      console.log("Detected batch ID:", batchId);
      return await handleBatchVerification(batchId);
    } else {
      return "❌ Could not detect any batch number in the image. Please retake a clear photo of the label.";
    }
  } catch (error) {
    console.error("OCR/Verification Error:", error);
    return "⚠️ Something went wrong while reading the image. Please try again later.";
  }
}

// -----------------------------------------
// 🧾 Utility Functions
// -----------------------------------------
function helpMenu() {
  return `👋 *Welcome to Afiya Verification System*\n\nYou can:\n• Verify a drug: Send the *batch ID* (e.g., AFY-001)\n• Verify a company: Type *verify company Emzor*\n• Or send a *photo* of the drug label for automatic check 🔍`;
}

function isLikelyBatchId(text) {
  return /^[A-Z0-9\-]{3,15}$/i.test(text.trim());
}

// -----------------------------------------
// 📲 Twilio WhatsApp Messaging
// -----------------------------------------
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = "whatsapp:+14155238886";
const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to, message) {
  try {
    await client.messages.create({ from, to, body: message });
    console.log(`✅ WhatsApp message sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
  }
}
