import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import https from "https";
import { execFileSync } from "child_process";

import app from "./app";
import { connectDB } from "./config/database";

const PORT = process.env.PORT || 5000;
const certDir = process.env.CERT_DIR || "/certs";
const keyPath = process.env.HTTPS_KEY_PATH || path.join(certDir, "localhost-key.pem");
const certPath = process.env.HTTPS_CERT_PATH || path.join(certDir, "localhost.pem");

const ensureCertificates = () => {
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return;
  }

  fs.mkdirSync(certDir, { recursive: true });
  execFileSync("openssl", [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    keyPath,
    "-out",
    certPath,
    "-days",
    "365",
    "-subj",
    "/CN=localhost",
    "-addext",
    "subjectAltName=DNS:localhost,IP:127.0.0.1",
  ]);
};

const startServer = async () => {
  await connectDB();
  ensureCertificates();

  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https.createServer(options, app).listen(PORT, () => {
    console.log(`🔒 HTTPS Server running at https://localhost:${PORT}`);
  });
};

startServer();
