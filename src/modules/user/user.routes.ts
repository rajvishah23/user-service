import express from "express"
import { getMe, updateMe, getUserByIdInternal, deleteMe } from "./user.controller"
import authenticate from "../../middlewares/auth.middleware"

const router = express.Router()

router.get("/me", authenticate, getMe)
router.patch("/me", authenticate, updateMe)
router.delete("/me", authenticate, deleteMe)

// Internal endpoint for other services to fetch user details
router.get("/internal/:id", getUserByIdInternal)

export default router

