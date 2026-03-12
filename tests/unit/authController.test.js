import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { register, login, logout } from "../../src/controllers/authController.js";
import { prisma } from "../../src/config/db.js";
import generateToken from "../../src/utils/generateToken.js";

// Mock prisma
vi.mock("../../src/config/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
    genSalt: vi.fn(),
  },
}));

// Mock generateToken
vi.mock("../../src/utils/generateToken.js", () => ({
  default: vi.fn(),
}));

describe("authController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      req.body = { name: "Test User", email: "test@example.com", password: "password123" };
      
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed-password");
      prisma.user.create.mockResolvedValue({ id: "1", email: "test@example.com", name: "Test User" });
      generateToken.mockReturnValue("mock-token");

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: "success",
        data: expect.objectContaining({
          token: "mock-token",
        }),
      }));
    });

    it("should return 400 if user already exists", async () => {
      req.body = { name: "Test User", email: "existing@example.com", password: "password123" };
      prisma.user.findUnique.mockResolvedValue({ id: "1" });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "User already exists",
      }));
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const mockUser = { id: "1", email: "test@example.com", password: "hashed-password" };
      
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue("mock-token");

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: "success",
        data: expect.objectContaining({
          token: "mock-token",
        }),
      }));
    });

    it("should return 401 for invalid credentials", async () => {
      req.body = { email: "test@example.com", password: "wrong-password" };
      prisma.user.findUnique.mockResolvedValue({ password: "hashed-password" });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Invalid credentials",
      }));
    });
  });

  describe("logout", () => {
    it("should clear the token cookie", async () => {
      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token", expect.anything());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: "success",
      }));
    });
  });
});
