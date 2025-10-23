require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Custom middleware
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// Routes
const customerRoutes = require("./routes/customers");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");

const app = express();

// Trust proxy for rate-limiting on Railway/Vercel
app.set("trust proxy", 1);

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGINS = (
  process.env.CORS_ORIGIN ||
  "http://localhost:3000,https://e-martshop.vercel.app"
).split(",");

// Security middleware
app.use(helmet());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(logger);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow server-to-server requests
      if (CORS_ORIGINS.indexOf(origin) === -1) {
        return callback(
          new Error(`CORS policy does not allow access from origin ${origin}`),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: "Too many requests from this IP, please try again later.",
  })
);

// Development request logging
if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "E-Mart API",
    routes: {
      customers: "/api/customers",
      products: "/api/products",
      orders: "/api/orders",
      auth: "/api/auth",
    },
    environment: NODE_ENV,
  });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});
