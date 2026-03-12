/**
 * @file server.js
 * @description Entry point for the Movie Watchlist Backend API.
 * This file initializes the Express application, connects to the database,
 * configures middleware, defines routes, and handles server lifecycle events.
 */

import dotenv from "dotenv"; // Environment variable management
import express from "express"; // Main web framework
import movieRoutes from "./routes/movieRoutes.js"; // Movie-related endpoints
import authRoutes from "./routes/authRoutes.js"; // Authentication endpoints
import watchlistRoutes from "./routes/watchlistRoutes.js"; // Watchlist endpoints
import rateLimit from "express-rate-limit"; // Traffic control
import { connectDB, disconnectDB } from "./config/db.js"; // Database utility
import { errorHandler, notFound } from "./middleware/errorMiddleware.js"; // Error handling

// Load environment variables from .env file
dotenv.config();

// Establish connection to MongoDB
connectDB();

const app = express();

// --- Middleware Configuration ---

/**
 * Global Middleware: Parse incoming JSON requests
 */
app.use(express.json());

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests from a single IP address.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the rate limit",
    });
  },
});

app.use(limiter);

// --- Route Definitions ---

/**
 * Movie related routes (v1)
 */
app.use("/movies/api/v1", movieRoutes);

/**
 * Authentication routes (v1) - Registration, Login, Logout
 */
app.use("/auth/api/v1", authRoutes);

/**
 * Watchlist management routes (v1)
 */
app.use("/watchlist/api/v1", watchlistRoutes);

/**
 * Error Handling Middleware
 */
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Global error handler

// --- Server Initialization ---

const PORT = process.env.PORT || 5001;

/**
 * Start the Express server
 */
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;

// --- Process Event Listeners ---

/**
 * Handle unhandled promise rejections (e.g., database connection errors)
 * Ensures the server closes cleanly and disconnects from the database.
 */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

/**
 * Handle uncaught exceptions
 * Forces a process exit after logging and database disconnection.
 */
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

/**
 * Graceful shutdown
 * Triggered by SIGTERM (e.g., from hosting providers or manual termination).
 */
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
