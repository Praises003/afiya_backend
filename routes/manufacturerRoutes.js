import express from "express";
import { registerManufacturer, getManufacturers } from "../controllers/manufacturerController.js";

const router = express.Router();

router.post("/register", registerManufacturer);
router.get("/", getManufacturers);

export default router;
