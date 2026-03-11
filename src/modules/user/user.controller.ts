import { Response } from "express"
import { prisma } from "../../config/prisma"
import { AuthRequest } from "../../middlewares/auth.middleware"
import redisClient from "../../config/redis"
import { publishMessage } from '../../config/rabbitmq'

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({ user })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export const updateMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const { name, email } = req.body as { name?: string; email?: string }

  if (!name && !email) {
    return res.status(400).json({ message: "Nothing to update" })
  }

  try {
    const data: { name?: string; email?: string } = {}

    if (name) {
      data.name = name
    }

    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email }
      })

      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: "Email already in use" })
      }

      data.email = email
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return res.json({ user: updated })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export const getUserByIdInternal = async (req: AuthRequest, res: Response) => {
  const idParam = req.params.id

  if (!idParam || typeof idParam !== "string") {
    return res.status(400).json({ message: "Invalid user id" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: idParam },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({ user })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export const deleteMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    })

    await redisClient.del(`refreshToken:${req.user.id}`)

    // Publish event to RabbitMQ
    await publishMessage('user.deleted', { userId: req.user.id })

    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}
