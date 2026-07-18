import cors from "cors";
import express from "express";
import healthRouter from "./routes/health.routes.js";
import diagnosisRouter from "./routes/diagnosis.routes.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/health", healthRouter);
app.use("/api/diagnose", diagnosisRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
