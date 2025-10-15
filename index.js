import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import topicRoutes from "./routes/topicRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/topic", topicRoutes);
app.use("/api/register-drug", topicRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    
})
.then(() => {
  console.log("✅ Connected to MongoDB");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
