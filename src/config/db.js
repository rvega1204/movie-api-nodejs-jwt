/**
 * @file db.js
 * @description Database configuration and connection management using Prisma and MariaDB.
 * This module exports the Prisma client instance and helper functions to connect/disconnect.
 */

import { PrismaClient } from "../generated/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * Prisma Client instance
 * @type {PrismaClient}
 */
let prisma;

/**
 * Initializes the database connection.
 * Configures the Prisma adapter for MariaDB and starts the connection.
 * Exits the process if the connection fails.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

    prisma = new PrismaClient({
      adapter,
      // Log queries and errors in development mode, only errors in production
      log: process.env.NODE_ENV === "dev" ? ["query", "error"] : ["error"],
    });

    await prisma.$connect();
    console.log("Database connected via Prisma");
  } catch (error) {
    console.error("Database connection error", error);
    process.exit(1);
  }
};

/**
 * Closes the database connection.
 * Ensures that the Prisma client disconnects properly.
 * 
 * @async
 * @function disconnectDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log("Database disconnected via Prisma");
    }
  } catch (error) {
    console.error("Database disconnection error", error);
    process.exit(1);
  }
};

export { prisma, connectDB, disconnectDB };
