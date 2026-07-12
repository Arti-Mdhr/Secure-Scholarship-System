import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Secure Scholarship API Running",
  });
});

export default app;