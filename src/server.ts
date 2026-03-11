import app from './app'
import { connectRedis } from "./config/redis";
import logger from "./config/logger"

const PORT = process.env.PORT || 8000

const startServer = async () => {
  await connectRedis();
  app.listen(PORT, () => {
    logger.info(`🚀 User service running on port ${PORT}`);
  });
};

startServer();