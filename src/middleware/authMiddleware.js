/**
 * @file authMiddleware.js
 * @description Middleware to authenticate users using JWT tokens.
 * Extracts the token from either the Authorization header (Bearer) or a 'token' cookie.
 */

import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";

/**
 * Authentication Middleware
 * 
 * Verifies the JWT token and attaches the authenticated user object to the request.
 * Returns a 401 Unauthorized response if the token is missing or invalid.
 * 
 * @async
 * @function authMiddleware
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>}
 */
const authMiddleware = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // Fallback: check for token in cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // If no token is found, deny access
  if (!token)
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });

  try {
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user information to request object for use in controllers
    req.user = user;
    next();
  } catch (error) {
    // Handle invalid or expired tokens
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default authMiddleware;
