import multer from "multer";
import { AppError } from "../utils/AppError.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const accepted = allowedMimeTypes.has(file.mimetype);
    callback(accepted ? null : new AppError("Upload a JPG, PNG, or WebP crop photo.", 400), accepted);
  },
}).single("image");
