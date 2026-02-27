const mysql = require('mysql2');
const http = require('http');

// 1. Start a tiny web server so Render doesn't kill the deploy
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running. Check logs for DB status.');
}).listen(port, '0.0.0.0', () => {
  console.log(`Web server listening on port ${port}`);
});

// 2. Run the MySQL Test
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  connectTimeout: 20000 // Increased timeout
});

console.log("--- STARTING DATABASE CONNECTION TEST ---");

connection.connect((err) => {
  if (err) {
    console.error('❌ DB TEST FAILED:', err.code, err.message);
  } else {
    console.log('✅ DB TEST SUCCESSFUL!');
    connection.end();
  }
});