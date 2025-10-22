const mysql = require("mysql2/promise")

// Optional SSL support for managed MySQL providers (e.g. Aiven, PlanetScale)
// Configure via env:
// - DB_SSL=true|required
// - DB_SSL_REJECT_UNAUTHORIZED=true|false (default true)
// - DB_SSL_CA=<PEM content or \n-separated string> (optional, recommended by some providers)
const sslMode = String(process.env.DB_SSL || process.env.DB_SSL_MODE || "").toLowerCase()
let ssl
if (sslMode === "true" || sslMode === "required" || sslMode === "require") {
  ssl = {
    rejectUnauthorized:
      process.env.DB_SSL_REJECT_UNAUTHORIZED === undefined
        ? true
        : String(process.env.DB_SSL_REJECT_UNAUTHORIZED).toLowerCase() !== "false",
  }
  if (process.env.DB_SSL_CA) {
    // Allow providing CA as a single-line env where newlines are encoded as \n
    ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, "\n")
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "qcs_user",
  password: process.env.DB_PASSWORD || "qcs_password",
  database: process.env.DB_NAME || "qcs_db",
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

module.exports = pool
