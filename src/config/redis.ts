import { createClient } from "redis";
import logger from "./logger";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  logger.info("✅ Redis Connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis Error:", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;