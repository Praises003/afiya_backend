import express from "express";
import { registerDrug } from "../controllers/topicController.js";

const router = express.Router();

// POST /api/register-drug
router.post("/", registerDrug);

export default router;
