/**
 * @file authRoutes.js
 * @description Routes for user authentication (Register, Login, Logout).
 */

import express from "express";
import { register, login, logout } from "../controllers/authController.js";

const router = express.Router();

/**
 * @route POST /auth/api/v1/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", register);

/**
 * @route POST /auth/api/v1/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post("/login", login);

/**
 * @route POST /auth/api/v1/logout
 * @desc Logout user and clear cookie
 * @access Private/Public
 */
router.post("/logout", logout);

export default router;
