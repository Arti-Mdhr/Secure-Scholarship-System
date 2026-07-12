import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import applicationRoutes from "./routes/application.routes";
import documentRoutes from "./routes/document.routes";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Secure Scholarship API Running",
  });
});

app.get("/test", (req, res) => {
  res.json({ message: "working" });
});

app.use(
  "/api",
  documentRoutes
);

export default app;