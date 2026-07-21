import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
// import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import applicationRoutes from "./routes/application.routes";
import documentRoutes from "./routes/document.routes";

const app = express();

/**
 * Hide Express technology header
 */
app.disable("x-powered-by");

/**
 * Security Headers
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },

    frameguard: {
      action: "deny",
    },

    referrerPolicy: {
      policy: "no-referrer",
    },

    crossOriginEmbedderPolicy: false,
  })
);

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

/**
 * Request Body Parsers
 */
app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

/**
 * MongoDB Injection Protection
 */
// app.use(mongoSanitize());

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api", documentRoutes);

/**
 * Health Check
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Secure Scholarship API Running",
  });
});

/**
 * Development Test Route
 * Remove before production deployment.
 */
app.get("/test", (req, res) => {
  res.json({
    message: "working",
  });
});

export default app;