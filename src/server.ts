/* eslint-disable no-console */
import http from "http";

import app from "./app";
import env from "./app/configs/env";

const PORT = env.PORT;

async function bootstrap() {
  try {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 RentNest Server running on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string) => {
      console.log(`🔄 Received ${signal}, 🛑 Shutting down server...`);

      server.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      shutdown("Unhandled Rejection");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
