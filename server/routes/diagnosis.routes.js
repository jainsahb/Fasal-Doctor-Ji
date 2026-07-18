import { Router } from "express";
import { createDiagnosis } from "../controllers/diagnosis.controller.js";
import { uploadImage } from "../middlewares/upload.middleware.js";

const router = Router();
router.post("/", uploadImage, createDiagnosis);

export default router;
