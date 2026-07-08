import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.middleware";
import v1Routes from "./app/v1/routes";
import morgan from "morgan";
import upload from "./app/middlewares/multer.middleware";

const app: Application = express();

// Parsers
app.use("/api/v1/payments/confirm", express.raw({ type: "application/json" }));
app.use(upload.none());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "RentNest API is running.",
  });
});

// API Routes
app.use("/api/v1", v1Routes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
