/**
 * @file watchlistController.js
 * @description Controller for managing the user's movie watchlist: add, update, and delete.
 */

import { prisma } from "../config/db.js";

/**
 * Extracts the ID from request parameters and validates its presence.
 * 
 * @function getIdFromParams
 * @param {import('express').Request} req - Express request object.
 * @returns {number|import('express').Response} Returns the parsed ID as a number, or sends a 400 response if missing.
 */
function getIdFromParams(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  return Number(id);
}

/**
 * Validates if the watchlist item exists and belongs to the authenticated user.
 * 
 * @function validateWatchlist
 * @param {object} watchlistItem - The watchlist item from the database.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {void|import('express').Response} Sends an error response if invalid, otherwise nothing.
 */
function validateWatchlist(watchlistItem, req, res) {
  // Check if item exists
  if (!watchlistItem) {
    return res.status(404).json({ message: "Watchlist item not found" });
  }

  // Authorize: ensure the item belongs to the current user
  if (watchlistItem.userId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }
}

/**
 * Adds a movie to the user's watchlist.
 * Verifies movie existence and ensures no duplicates.
 * 
 * @async
 * @function addToWatchList
 * @param {import('express').Request} req - Express request object containing movie details.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const addToWatchList = async (req, res) => {
  const { movieId, status, rating, notes } = req.body;

  // Verify the movie exists in the main movie table
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  // Check if it's already in the user's watchlist
  const existingInWatchlist = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: req.user.id,
        movieId,
      },
    },
  });

  if (existingInWatchlist) {
    return res.status(404).json({ message: "Movie already in the watchlist" });
  }

  // Create the new watchlist entry
  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      userId: req.user.id,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      watchlistItem,
    },
  });
};

/**
 * Updates an existing watchlist item (status, rating, or notes).
 * 
 * @async
 * @function updateWatchList
 * @param {import('express').Request} req - Express request object containing updated data.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const updateWatchList = async (req, res) => {
  const id = getIdFromParams(req, res);
  const { status, rating, notes } = req.body;

  // Retrieve existing entry
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id },
  });

  // Validate existence and ownership
  validateWatchlist(watchlistItem, req, res);

  // Prepare delta for update
  const updatedData = {};
  if (status) updatedData.status = status;
  if (rating) updatedData.rating = rating;
  if (notes) updatedData.notes = notes;

  // Perform update in database
  const updatedWatchlistItem = await prisma.watchlistItem.update({
    where: { id },
    data: updatedData,
  });

  res.status(200).json({
    status: "success",
    data: {
      watchlistItem: updatedWatchlistItem,
    },
  });
};

/**
 * Removes an item from the user's watchlist.
 * 
 * @async
 * @function deleteWatchList
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const deleteWatchList = async (req, res) => {
  const id = getIdFromParams(req, res);

  // Retrieve existing entry
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id },
  });

  // Validate existence and ownership
  validateWatchlist(watchlistItem, req, res);

  // Remove from database
  await prisma.watchlistItem.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Watchlist item deleted successfully",
  });
};

export { addToWatchList, deleteWatchList, updateWatchList };
