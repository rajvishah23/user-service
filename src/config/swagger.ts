import swaggerJsDoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Service API",
      version: "1.0.0",
      description: "User and authentication service for URL Shortener"
    },
    servers: [
      {
        url: "http://localhost:8000"
      }
    ]
  },
  apis: ["./src/docs/**/*.swagger.ts"]
}

const swaggerSpec = swaggerJsDoc(options)

export default swaggerSpec