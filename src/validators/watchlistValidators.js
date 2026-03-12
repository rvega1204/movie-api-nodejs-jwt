/**
 * @file watchlistValidators.js
 * @description Zod validation schemas for movie watchlist operations.
 */

import { z } from "zod";

/**
 * Schema for adding a movie to the watchlist.
 * Requires a valid UUID for the movie and validates optional status, rating, and notes.
 */
const addToWatchlistSchema = z.object({
  movieId: z.string().uuid(),
  status: z
    .enum(["PLANNED", "WATCHING", "COMPLETED", "DROPPED"], {
      errorMap: () => ({
        message: "Invalid status",
      }),
    })
    .optional(),
  rating: z.coerce
    .number()
    .int("Rating must be an integer")
    .min(1, { message: "Rating must be between 1 and 10" })
    .max(10, { message: "Rating must be between 1 and 10" })
    .optional(),
  notes: z
    .string()
    .min(1, { message: "Notes must be at least 1 character long" })
    .max(255, { message: "Notes must be at most 255 characters long" })
    .optional(),
});

/**
 * Schema for updating an existing watchlist item.
 * Requires the watchlist item ID and allows updating status, rating, or notes.
 */
const updatedWatchlistSchema = z.object({
  id: z.coerce.number().int(),
  status: z.enum(["PLANNED", "WATCHING", "COMPLETED", "DROPPED"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
  rating: z.coerce
    .number()
    .int("Rating must be an integer")
    .min(1, { message: "Rating must be between 1 and 10" })
    .max(10, { message: "Rating must be between 1 and 10" })
    .optional(),
  notes: z
    .string()
    .min(1, { message: "Notes must be at least 1 character long" })
    .max(255, { message: "Notes must be at most 255 characters long" })
    .optional(),
});

/**
 * Schema for deleting a watchlist item.
 * Requires a valid integer ID.
 */
const deleteWatchlistSchema = z.object({
  id: z.coerce.number().int(),
});

export { addToWatchlistSchema, updatedWatchlistSchema, deleteWatchlistSchema };
