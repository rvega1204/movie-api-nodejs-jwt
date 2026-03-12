/**
 * @file authController.js
 * @description Controller for authentication-related operations: user registration, login, and logout.
 */

import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

/**
 * Registers a new user.
 * Validates input, hashes the password, creates the user in the database,
 * and generates a JWT token.
 * 
 * @async
 * @function register
 * @param {import('express').Request} req - Express request object containing name, email, and password.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user in database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Generate JWT and set cookie
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name,
        email,
      },
      token,
    },
  });
};

/**
 * Authenticates a user.
 * Validates credentials and generates a JWT token upon success.
 * 
 * @async
 * @function login
 * @param {import('express').Request} req - Express request object containing email and password.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare provided password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT and set cookie
  const token = generateToken(user.id, res);

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    },
  });
};

/**
 * Logs out the current user.
 * Clears the authentication cookie.
 * 
 * @async
 * @function logout
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const logout = async (req, res) => {
  // Clear the JWT cookie
  res.clearCookie("token", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

export { register, login, logout };
