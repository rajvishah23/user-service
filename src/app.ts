import 'dotenv/config'
import express, { Express } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import logger from "./config/logger"
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/user/user.routes'
import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./config/swagger"

const app: Express = express()

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(
  morgan("combined", {
    stream: {
      write: (message : string) => logger.info(message.trim())
    }
  })
)

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)


export default app
