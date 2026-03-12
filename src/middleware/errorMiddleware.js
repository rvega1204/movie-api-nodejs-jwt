/**
 * @file errorMiddleware.js
 * @description Global error handling and 404 middleware for the Express application.
 * Includes specialized handling for Prisma-related errors.
 */

import { prisma } from "../config/db.js";

/**
 * 404 Not Found handler
 * Catch-all middleware for routes that are not defined.
 *
 * @function notFound
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler middleware
 * Centralized error reporting: formats errors and sends JSON responses.
 * Provides detailed stack traces in development mode.
 *
 * @function errorHandler
 * @param {Error} err - Error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // --- Specialized Prisma Error Handling ---

  // Handle Prisma internal validation errors (e.g., missing required fields)
  if (err instanceof Prisma.PrismaClientValidationError) {
    err.statusCode = 400;
    err.message = "Invalid data provided";
  }

  // Handle Prisma known request errors (e.g. unique constraint, not found)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation (e.g., email already in use)
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      err.statusCode = 400;
      err.message = `${field} already exists`;
    }
    // P2025: Record not found during an update or delete
    if (err.code === "P2025") {
      err.statusCode = 404;
      err.message = "Record not found";
    }
    // P2003: Foreign key constraint violation
    if (err.code === "P2003") {
      err.statusCode = 400;
      err.message = "Invalid reference: related record does not exist";
    }
  }

  // --- Send Final JSON Response ---
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // Only reveal stack trace if explicitly in development mode
    ...(process.env.NODE_ENV === "dev" && { stack: err.stack }),
  });
};

export { notFound, errorHandler };
