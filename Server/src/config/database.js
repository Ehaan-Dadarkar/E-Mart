require("dotenv").config();
const mysql = require("mysql2/promise");

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, // must match your Railway DB
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection immediately
(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS test");
    console.log("✅ Database connected successfully:", rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Exit if DB connection fails
  }
})();

module.exports = pool;
