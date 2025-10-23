require("dotenv").config();
const mysql = require("mysql2/promise");

let pool;

// Determine if we should use MYSQL_URL or individual env variables
if (process.env.MYSQLURL) {
  try {
    const dbUrl = new URL(process.env.MYSQLURL);
    pool = mysql.createPool({
      host: dbUrl.hostname,
      port: dbUrl.port || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.replace("/", ""),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log("🔗 Using MYSQLURL for database connection");
  } catch (err) {
    console.error("❌ Invalid MYSQLURL:", err.message);
  }
} else {
  pool = mysql.createPool({
    host: process.env.MYSQLHOST || "localhost",
    port: parseInt(process.env.MYSQLPORT) || 3306,
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "",
    database: process.env.MYSQLDATABASE || "ecommerce_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  console.log(
    "🔗 Using individual environment variables for database connection"
  );
}

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(
      `✅ Database connected successfully to ${conn.config.database} at ${conn.config.host}:${conn.config.port}`
    );
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:");
    console.error("   Host:", process.env.MYSQLHOST);
    console.error("   User:", process.env.MYSQLUSER);
    console.error("   Database:", process.env.MYSQLDATABASE);
    console.error("   Error:", err.message);
  }
})();

module.exports = pool;
