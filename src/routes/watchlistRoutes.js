/**
 * @file watchlistRoutes.js
 * @description Routes for managing a user's movie watchlist.
 * All routes require authentication and validate input via Zod schemas.
 */

import express from "express";
import {
  addToWatchList,
  deleteWatchList,
  updateWatchList,
} from "../controllers/watchlistController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  addToWatchlistSchema,
  updatedWatchlistSchema,
  deleteWatchlistSchema,
} from "../validators/watchlistValidators.js";

const router = express.Router();

// Protect all routes below this middleware
router.use(authMiddleware);

/**
 * @route POST /watchlist/api/v1/
 * @desc Add a movie to the user's watchlist
 * @access Private
 */
router.post("/", validateRequest(addToWatchlistSchema), addToWatchList);

/**
 * @route PUT /watchlist/api/v1/:id
 * @desc Update a watchlist item (status, rating, notes)
 * @access Private
 */
router.put("/:id", validateRequest(updatedWatchlistSchema), updateWatchList);

/**
 * @route DELETE /watchlist/api/v1/:id
 * @desc Remove an item from the watchlist
 * @access Private
 */
router.delete("/:id", validateRequest(deleteWatchlistSchema), deleteWatchList);

export default router;
