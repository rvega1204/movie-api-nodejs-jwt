import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import authMiddleware from "../../src/middleware/authMiddleware.js";
import { prisma } from "../../src/config/db.js";

// Mock jwt
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

// Mock prisma
vi.mock("../../src/config/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("should permit access if a valid token is provided in headers", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    req.headers.authorization = "Bearer valid-token";
    
    jwt.verify.mockReturnValue({ id: "1" });
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if no token is provided", async () => {
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining("no token provided"),
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if user is not found in database", async () => {
    req.headers.authorization = "Bearer valid-token";
    jwt.verify.mockReturnValue({ id: "non-existent" });
    prisma.user.findUnique.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "User not found",
    }));
  });
});
