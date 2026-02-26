const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const fs = require("fs")

dotenv.config()

// Fix: Handle "false" string from environment variables which evaluates to true
if (process.env.DB_SSL === "false") process.env.DB_SSL = ""
if (process.env.DB_SSL_MODE === "false") process.env.DB_SSL_MODE = ""

const app = express()

// Middleware
// Configure CORS
const allowedOrigin = process.env.CORS_ORIGIN || "*"
app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || "./uploads"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Serve uploaded files
app.use("/uploads", express.static(uploadDir))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/suppliers", require("./routes/suppliers"))
app.use("/api/products", require("./routes/products"))
app.use("/api/issues", require("./routes/issues"))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error",
      status: err.status || 500,
    },
  })
})

const PORT = process.env.PORT || 5000

// Wait for database connection before starting server
const db = require("./config/database")

// Log target DB connection info (sanitized)
console.log("DB connect target:", {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "qcs_db",
  ssl: Boolean(process.env.DB_SSL || process.env.DB_SSL_MODE),
})

db.getConnection()
  .then((connection) => {
    connection.release()
    console.log("Database connected successfully")

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Database connection failed:", err)
    process.exit(1)
  })
