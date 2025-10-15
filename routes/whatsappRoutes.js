import express from "express";
import { whatsappWebhook } from "../controllers/whatsappController.js";

const router = express.Router();

// Twilio webhook (POST)
router.post("/webhook", whatsappWebhook);

export default router;
