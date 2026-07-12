import jwt from "jsonwebtoken";

export const generateAccessToken = (
  userId: string,
  role: string
): string => {
  return jwt.sign(
    {
      sub: userId,
      role,
    },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (
  userId: string
): string => {
  return jwt.sign(
    {
      sub: userId,
    },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};