/**
 * @file generateToken.js
 * @description Utility for generating JWT tokens and setting them as HTTP-only cookies.
 */

import jwt from "jsonwebtoken";

/**
 * Generates a JSON Web Token and sets it in an HTTP-only cookie.
 * 
 * @function generateToken
 * @param {string} userId - The unique identifier of the user.
 * @param {import('express').Response} res - Express response object to set the cookie.
 * @returns {string} The generated JWT token.
 */
const generateToken = (userId, res) => {
  // Sign the token with user ID and secret
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  // Configure cookie options
  res.cookie("token", token, {
    httpOnly: true, // Prevent client-side script access
    secure: process.env.NODE_ENV === "prod", // Send only over HTTPS in production
    sameSite: "strict", // Mitigate CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

export default generateToken;
