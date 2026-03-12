import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMovies, createMovie, updateMovie, deleteMovie } from "../../src/controllers/movieController.js";
import { prisma } from "../../src/config/db.js";

// Mock prisma
vi.mock("../../src/config/db.js", () => ({
  prisma: {
    movie: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("movieController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user-123" },
      params: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("getMovies", () => {
    it("should return all movies for the authenticated user", async () => {
      const mockMovies = [{ id: 1, title: "Inception", userId: "user-123" }];
      prisma.movie.findMany.mockResolvedValue(mockMovies);

      await getMovies(req, res);

      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });
  });

  describe("createMovie", () => {
    it("should create a new movie successfully", async () => {
      req.body = { title: "Inception", releaseYear: 2010 };
      const mockMovie = { id: 1, ...req.body, userId: "user-123" };
      prisma.movie.create.mockResolvedValue(mockMovie);

      await createMovie(req, res);

      expect(prisma.movie.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          title: "Inception",
          userId: "user-123",
        }),
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMovie);
    });
  });

  describe("updateMovie", () => {
    it("should update an existing movie successfully", async () => {
      req.params.id = "1";
      req.body = { title: "Inception Updated" };
      const existingMovie = { id: 1, title: "Inception", userId: "user-123" };
      const updatedMovie = { id: 1, title: "Inception Updated", userId: "user-123" };

      prisma.movie.findUnique.mockResolvedValue(existingMovie);
      prisma.movie.update.mockResolvedValue(updatedMovie);

      await updateMovie(req, res);

      expect(prisma.movie.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedMovie);
    });

    it("should return 403 if user does not own the movie", async () => {
      req.params.id = "1";
      const existingMovie = { id: 1, userId: "other-user" };
      prisma.movie.findUnique.mockResolvedValue(existingMovie);

      await updateMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
    });
  });

  describe("deleteMovie", () => {
    it("should delete a movie successfully", async () => {
      req.params.id = "1";
      const existingMovie = { id: 1, userId: "user-123" };
      prisma.movie.findUnique.mockResolvedValue(existingMovie);

      await deleteMovie(req, res);

      expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("should return 404 if movie not found", async () => {
      req.params.id = "999";
      prisma.movie.findUnique.mockResolvedValue(null);

      await deleteMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Movie not found" });
    });
  });
});
