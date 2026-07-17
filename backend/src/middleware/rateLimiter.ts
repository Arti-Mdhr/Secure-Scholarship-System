import rateLimit from "express-rate-limit";

export const loginLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 5,

    message: {
      success: false,
      message:
        "Too many login attempts. Try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
  });

export const mfaLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 5,

    message: {
      success: false,
      message:
        "Too many MFA attempts. Try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
  });

export const passwordResetRequestLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 3,

    message: {
      success: false,
      message:
        "Too many password reset requests.",
    },

    standardHeaders: true,
    legacyHeaders: false,
  });

export const passwordResetLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 5,

    message: {
      success: false,
      message:
        "Too many password reset attempts.",
    },

    standardHeaders: true,
    legacyHeaders: false,
  });

export const refreshLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 10,

    message: {
      success: false,
      message:
        "Too many token refresh requests.",
    },

    standardHeaders: true,
    legacyHeaders: false,
  });