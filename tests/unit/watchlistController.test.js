import { describe, it, expect, vi, beforeEach } from "vitest";
import { addToWatchList, updateWatchList, deleteWatchList } from "../../src/controllers/watchlistController.js";
import { prisma } from "../../src/config/db.js";

// Mock prisma
vi.mock("../../src/config/db.js", () => ({
  prisma: {
    movie: {
      findUnique: vi.fn(),
    },
    watchlistItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("watchlistController", () => {
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
    };
    vi.clearAllMocks();
  });

  describe("addToWatchList", () => {
    it("should add a movie to the watchlist successfully", async () => {
      req.body = { movieId: 1, status: "WATCHING" };
      prisma.movie.findUnique.mockResolvedValue({ id: 1 });
      prisma.watchlistItem.findUnique.mockResolvedValue(null);
      prisma.watchlistItem.create.mockResolvedValue({ id: 10, ...req.body, userId: "user-123" });

      await addToWatchList(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: "success",
      }));
    });

    it("should return 404 if movie does not exist", async () => {
      req.body = { movieId: 999 };
      prisma.movie.findUnique.mockResolvedValue(null);

      await addToWatchList(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Movie not found" });
    });

    it("should return 404 if movie already in watchlist", async () => {
      req.body = { movieId: 1 };
      prisma.movie.findUnique.mockResolvedValue({ id: 1 });
      prisma.watchlistItem.findUnique.mockResolvedValue({ id: 10 });

      await addToWatchList(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Movie already in the watchlist" });
    });
  });

  describe("updateWatchList", () => {
    it("should update a watchlist item successfully", async () => {
      req.params.id = "10";
      req.body = { status: "COMPLETED" };
      const existingItem = { id: 10, userId: "user-123", status: "WATCHING" };
      prisma.watchlistItem.findUnique.mockResolvedValue(existingItem);
      prisma.watchlistItem.update.mockResolvedValue({ ...existingItem, status: "COMPLETED" });

      await updateWatchList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: "success",
      }));
    });
  });

  describe("deleteWatchList", () => {
    it("should delete a watchlist item successfully", async () => {
      req.params.id = "10";
      const existingItem = { id: 10, userId: "user-123" };
      prisma.watchlistItem.findUnique.mockResolvedValue(existingItem);

      await deleteWatchList(req, res);

      expect(prisma.watchlistItem.delete).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Watchlist item deleted successfully",
      }));
    });
  });
});
