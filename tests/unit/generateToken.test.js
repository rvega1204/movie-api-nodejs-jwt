import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import generateToken from "../../src/utils/generateToken.js";

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe("generateToken utility", () => {
  let res;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    // Mock Express response object
    res = {
      cookie: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("should generate a token and set it as a cookie", () => {
    const userId = "user-123";
    const mockToken = "mock-jwt-token";
    
    jwt.sign.mockReturnValue(mockToken);

    const token = generateToken(userId, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: userId },
      "test-secret",
      expect.anything()
    );

    expect(res.cookie).toHaveBeenCalledWith("token", mockToken, expect.objectContaining({
      httpOnly: true,
      sameSite: "strict",
    }));

    expect(token).toBe(mockToken);
  });
});
