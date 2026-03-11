import { connectRedis } from "./config/redis"
import { connectRabbitMQ } from "./config/rabbitmq"
import app from './app'
import logger from "./config/logger"

const PORT = process.env.PORT || 8000

const startServer = async () => {
  await connectRedis()
  await connectRabbitMQ()
  app.listen(PORT, () => {
    logger.info(`🚀 User service running on port ${PORT}`)
  })
}

startServer()