import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Secure Scholarship API Running",
  });
});

export default app;