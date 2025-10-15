import express from "express";
import { registerManufacturer, getManufacturers, loginManufacturer } from "../controllers/manufacturerController.js";

const router = express.Router();

router.post("/register", registerManufacturer);
router.get("/", getManufacturers);
router.post("/login", loginManufacturer);

export default router;
