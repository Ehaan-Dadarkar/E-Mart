require("dotenv").config();
const mysql = require("mysql2/promise");
const url = require("url");

let connectionConfig = {};

if (process.env.MYSQL_URL) {
  const params = new URL(process.env.MYSQL_URL);
  connectionConfig = {
    host: params.hostname,
    port: params.port,
    user: params.username,
    password: params.password,
    database: params.pathname.replace("/", ""),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
} else {
  connectionConfig = {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "ecommerce_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

const pool = mysql.createPool(connectionConfig);

// Test connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = pool;
