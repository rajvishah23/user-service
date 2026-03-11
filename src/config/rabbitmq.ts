import amqp from 'amqplib'
import logger from './logger'

let channel: amqp.Channel

export const connectRabbitMQ = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672')
  channel = await conn.createChannel()
  await channel.assertQueue('user.deleted', { durable: true })
  logger.info('✅ RabbitMQ Connected')
}

export const publishMessage = async (queue: string, message: object) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized')
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true })
  logger.info(`📤 Published to ${queue}: ${JSON.stringify(message)}`)
}
