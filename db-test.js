const mysql = require('mysql2');
const http = require('http');
const https = require('https');

const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') return res.end();

  // Config for display (hiding password)
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '****' : '(none)',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  };

  // Fetch Public IP to help with whitelisting
  const getPublicIp = () => new Promise(resolve => {
    https.get('https://api.ipify.org', (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => resolve(data));
    }).on('error', () => resolve('Unknown'));
  });

  getPublicIp().then(publicIp => {
  // Attempt connection
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectTimeout: 5000
  });

  connection.connect((err) => {
    let statusHtml = '';
    let bgColor = '#f4f4f9';
    
    if (err) {
      console.error('DB Error:', err.message);
      statusHtml = `
        <h1 style="color: #d32f2f">Connection Failed</h1>
        <div style="background: #ffebee; padding: 15px; border-radius: 5px; border: 1px solid #ef9a9a; color: #c62828;">
          <strong>Error Code:</strong> ${err.code}<br>
          <strong>Message:</strong> ${err.message}
        </div>
        <p><strong>Troubleshooting Hints:</strong></p>
        <ul>
          <li><strong>ETIMEDOUT:</strong> The firewall at <em>${dbConfig.host}</em> is blocking the connection. Whitelist the IP below.</li>
          <li><strong>ER_ACCESS_DENIED_ERROR:</strong> Check your username or password.</li>
          <li><strong>ENOTFOUND:</strong> The hostname is incorrect.</li>
        </ul>
      `;
    } else {
      statusHtml = `
        <h1 style="color: #2e7d32">✅ Connection Successful!</h1>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; border: 1px solid #a5d6a7; color: #2e7d32;">
          The backend can successfully read/write to the database.
        </div>
      `;
      connection.end();
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DB Status</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 700px; margin: 0 auto; background: ${bgColor}; }
          .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
          button { padding: 10px 20px; cursor: pointer; font-size: 1rem; background: #007bff; color: white; border: none; border-radius: 4px; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="card">
          ${statusHtml}
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; border: 1px solid #90caf9; color: #0d47a1; margin-bottom: 20px;">
            <strong>ℹ️ Current Server IP:</strong> <span style="font-size: 1.2em; font-weight: bold;">${publicIp}</span><br>
            <small>If connection fails with ETIMEDOUT, add this IP to "Remote MySQL" in cPanel.</small>
          </div>
          <h3>Current Configuration:</h3>
          <pre>${JSON.stringify(dbConfig, null, 2)}</pre>
          <br>
          <button onclick="window.location.reload()">Test Again</button>
        </div>
      </body>
      </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});