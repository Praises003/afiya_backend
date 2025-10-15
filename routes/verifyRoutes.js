import express from "express";
import { verifyBatch } from "../controllers/verifyController.js";

const router = express.Router();

// GET /api/verify/:batchId
router.get("/:batchId", verifyBatch);

export default router;
