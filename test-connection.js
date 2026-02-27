const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Shared hosts usually fail if you try to force SSL externally
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 15000 
});

connection.connect((err) => {
  if (err) {
    console.error('❌ DATABASE CONNECTION ERROR:');
    console.error('Code:', err.code);
    console.error('Message:', err.message);
    
    if (err.code === 'ETIMEDOUT') {
      console.log('👉 Hint: The firewall might still be blocking the port.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('👉 Hint: Port is open, but check your username/password and cPanel Remote MySQL settings.');
    }
  } else {
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY!');
    connection.end();
  }
});