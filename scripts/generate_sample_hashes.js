// Script to generate bcrypt hashes for sample users
const bcrypt = require('bcryptjs');

async function hashPasswords() {
  const adminPassword = await bcrypt.hash('admin', 10);
  const userPassword = await bcrypt.hash('user', 10);
  console.log('Admin hash:', adminPassword);
  console.log('User hash:', userPassword);
}

hashPasswords();
