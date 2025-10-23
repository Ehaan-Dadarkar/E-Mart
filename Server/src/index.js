require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const customerRoutes = require("./routes/customers");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");

const app = express();

// Trust Railway proxy
app.set("trust proxy", 1);

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ✅ Allowed CORS origins (include all your admin/client URLs)
const CORS_ORIGINS = (
  process.env.CORS_ORIGIN ||
  "http://127.0.0.1:5500,https://admin-ed-mart.vercel.app,https://e-martshop.vercel.app"
)
  .split(",")
  .map((o) => o.trim());

// ✅ Helmet for security
app.use(helmet());

// ✅ Parse JSON & URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Custom logging
app.use(logger);

// ✅ CORS FIXED CONFIG
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, curl, etc.
    if (CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`🚫 Blocked CORS request from origin: ${origin}`);
      return callback(
        new Error(`CORS policy does not allow access from origin ${origin}`),
        false
      );
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Enable CORS and preflight requests
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Important: allows OPTIONS preflight from any path

// ✅ Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    message: "Too many requests, please try again later.",
  })
);

// ✅ Extra CORS safety net headers (Railway sometimes strips them)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && CORS_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // respond OK for preflight
  }
  next();
});

// ✅ Routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.json({
    message: "E-Mart API is running",
    environment: NODE_ENV,
    allowedOrigins: CORS_ORIGINS,
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (${NODE_ENV})`);
  console.log("🌐 Allowed origins:", CORS_ORIGINS);
});
