import multer from "multer";
import { AppError } from "../utils/AppError.js";

export function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    error = new AppError("The crop photo must be 8 MB or smaller.", 400);
  }
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({
    error: statusCode >= 500 ? "We could not complete the crop check. Please try again shortly." : error.message,
  });
}
