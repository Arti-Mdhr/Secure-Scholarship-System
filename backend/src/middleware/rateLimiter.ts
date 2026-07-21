import rateLimit from "express-rate-limit";

const createLimiter = (
  max: number,
  message: string,
  skipSuccessfulRequests = false
) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,

    max,

    skipSuccessfulRequests,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });

export const loginLimiter = createLimiter(
  5,
  "Too many login attempts. Try again later.",
  true
);

export const mfaLimiter = createLimiter(
  5,
  "Too many MFA attempts. Try again later."
);

export const passwordResetRequestLimiter = createLimiter(
  3,
  "Too many password reset requests. Please try again later."
);

export const passwordResetLimiter = createLimiter(
  5,
  "Too many password reset attempts. Please try again later."
);

export const refreshLimiter = createLimiter(
  10,
  "Too many refresh attempts. Please try again later."
);