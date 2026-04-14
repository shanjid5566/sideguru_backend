import jwt from "jsonwebtoken";

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "development-secret";
};

export const generateToken = (payload: JwtPayload): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
};

export const decodeToken = (token: string): jwt.JwtPayload | string | null => {
  return jwt.decode(token);
};
