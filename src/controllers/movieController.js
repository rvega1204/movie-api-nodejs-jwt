import { prisma } from "../config/db.js";

/**
 * @file movieController.js
 * @description Controller for managing movie data: create, update, and delete.
 */

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
    return res.status(400).json({ message: "Movie ID is required" });
  }
  return Number(id);
}

/**
 * Validates if the movie exists and belongs to the authenticated user.
 *
 * @function validateMovie
 * @param {object} movie - The movie from the database.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {void|import('express').Response} Sends an error response if invalid, otherwise nothing.
 */
function validateMovie(movie, req, res) {
  // Check if item exists
  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }
  // Authorize: ensure the item belongs to the current user
  if (movie.userId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }
}

/**
 * Retrieves all movies for the authenticated user.
 *
 * @async
 * @function getMovies
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const getMovies = async (req, res) => {
  const movies = await prisma.movie.findMany({
    where: { userId: req.user.id },
  });

  res.status(200).json(movies);
};

/**
 * Creates a new movie.
 *
 * @async
 * @function createMovie
 * @param {import('express').Request} req - Express request object containing movie details.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const createMovie = async (req, res) => {
  const { title, releaseYear, overview, genres, runtime, posterUrl } = req.body;

  const movie = await prisma.movie.create({
    data: {
      title,
      releaseYear,
      overview,
      genres,
      runtime,
      posterUrl,
      userId: req.user.id,
    },
  });

  res.status(201).json(movie);
};

/**
 * Updates an existing movie.
 *
 * @async
 * @function updateMovie
 * @param {import('express').Request} req - Express request object containing updated data.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const updateMovie = async (req, res) => {
  const id = getIdFromParams(req, res);
  const { title, releaseYear, overview, genres, runtime, posterUrl } = req.body;

  // Retrieve existing entry
  const movie = await prisma.movie.findUnique({
    where: { id },
  });

  // Validate existence and ownership
  validateMovie(movie, req, res);

  // Prepare delta for update
  const updatedData = {};
  if (title) updatedData.title = title;
  if (releaseYear) updatedData.releaseYear = releaseYear;
  if (overview) updatedData.overview = overview;
  if (genres) updatedData.genres = genres;
  if (runtime) updatedData.runtime = runtime;
  if (posterUrl) updatedData.posterUrl = posterUrl;

  // Perform update in database
  const updatedMovie = await prisma.movie.update({
    where: { id },
    data: updatedData,
  });

  res.status(200).json(updatedMovie);
};

/**
 * Removes a movie.
 *
 * @async
 * @function deleteMovie
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const deleteMovie = async (req, res) => {
  const id = getIdFromParams(req, res);

  // Retrieve existing entry
  const movie = await prisma.movie.findUnique({
    where: { id },
  });

  // Validate existence and ownership
  validateMovie(movie, req, res);

  // Remove from database
  await prisma.movie.delete({
    where: { id },
  });

  res.status(204).send();
};

export { createMovie, updateMovie, deleteMovie, getMovies };
