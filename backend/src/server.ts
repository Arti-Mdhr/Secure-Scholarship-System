import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import https from "https";

import app from "./app";
import { connectDB } from "./config/database";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const options = {
    key: fs.readFileSync(
      path.join(__dirname, "../../certs/localhost-key.pem")
    ),
    cert: fs.readFileSync(
      path.join(__dirname, "../../certs/localhost.pem")
    ),
  };

  https.createServer(options, app).listen(PORT, () => {
    console.log(`🔒 HTTPS Server running at https://localhost:${PORT}`);
  });
};

startServer();