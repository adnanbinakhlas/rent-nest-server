/* eslint-disable no-console */
import http from "http";

import app from "./app";
import env from "./app/configs/env";
import prisma from "./app/libs/prisma";
import { awake } from "./app/utils/awake";
import { connectRedis } from "./app/libs/redis";

const PORT = env.PORT;

const server = http.createServer(app);

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);

  try {
    server.close(() => {
      console.log("✅ HTTP server closed.");
    });

    await prisma.$disconnect();
    console.log("✅ Prisma disconnected.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL via Prisma.");

    await connectRedis();
    console.log("✅ Redis connected.");

    server.listen(PORT, () => {
      console.log(`🚀 RentNest Server running on http://localhost:${PORT}`);
    });
    awake();
  } catch (error) {
    console.error("❌ Failed to start server:", error);

    await prisma.$disconnect().catch(() => {});

    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  void gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  void gracefulShutdown("unhandledRejection");
});

void bootstrap();
