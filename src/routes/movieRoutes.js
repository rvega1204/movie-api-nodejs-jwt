/**
 * @file movieRoutes.js
 * @description Routes for managing movie data.
 * All routes in this file are protected by authMiddleware and validated using Zod schemas.
 */

import express from "express";
import {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovies,
} from "../controllers/movieController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createMovieSchema,
  updateMovieSchema,
  deleteMovieSchema,
} from "../validators/movieValidators.js";

const router = express.Router();

// Apply authentication middleware to all movie routes
router.use(authMiddleware);

/**
 * @route GET /movies/api/v1/
 * @desc Get all movies for the authenticated user
 * @access Private
 */
router.get("/", getMovies);

/**
 * @route POST /movies/api/v1/
 * @desc Create a new movie
 * @access Private
 */
router.post("/", validateRequest(createMovieSchema), createMovie);

/**
 * @route PUT /movies/api/v1/:id
 * @desc Update an existing movie
 * @access Private
 */
router.put("/:id", validateRequest(updateMovieSchema), updateMovie);

/**
 * @route DELETE /movies/api/v1/:id
 * @desc Delete a movie
 * @access Private
 */
router.delete("/:id", validateRequest(deleteMovieSchema), deleteMovie);

export default router;
