import { prisma } from "../../config/prisma"
import bcrypt from "bcrypt"
import { Request, Response } from "express"
import redisClient from  "../../config/redis";
import jwt from "jsonwebtoken";
import { JWT_SECRET, ACCESS_TOKEN_EXPIRES, JWT_REFRESH_SECRET, REFRESH_TOKEN_EXPIRES } from "../../config/env"; 

export const register = async (req: Request, res: Response) => {

  try {
    const { name, email, password } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return res.status(201).json({
      message: "User registered successfully",
      user
    })

  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}


export const login = async (req: Request, res: Response) => {
  
  const { email, password } = req.body;

  // 1️⃣ Find user from DB
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 2️⃣ Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 3️⃣ Generate tokens

  const accessToken = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
 
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  // 4️⃣ Store refresh token in Redis
  await redisClient.set(
    `refreshToken:${user.id}`,
    refreshToken,
    { EX: 7 * 24 * 60 * 60 }
  );

  return res.json({ accessToken, refreshToken });
}

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // 1️⃣ Verify refresh token signature
    const decoded = jwt.verify(
      refreshToken,
      JWT_REFRESH_SECRET
    ) as { id: string };

    // 2️⃣ Check Redis (very important)
    const storedToken = await redisClient.get(
      `refreshToken:${decoded.id}`
    );

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // 3️⃣ Generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    return res.json({ accessToken: newAccessToken });

  } catch (error) {
    return res.status(403).json({ message: "Token expired or invalid" });
  }
}

export const logout = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID required" });
  }

  // Delete refresh token from Redis
  await redisClient.del(`refreshToken:${userId}`);

  return res.json({ message: "Logged out successfully" });
}