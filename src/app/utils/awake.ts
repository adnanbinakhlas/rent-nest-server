/* eslint-disable no-console */
import cron from "node-cron";
import env from "../configs/env";

export const awake = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      await fetch(env.SERVER_URL);
    } catch (error) {
      console.error(error);
    }
  });
};
