const fs = require("fs");
const https = require("https");
const next = require("next");
const path = require("path");
const { execFileSync } = require("child_process");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

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

app.prepare().then(() => {
  ensureCertificates();

  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https
    .createServer(options, (req, res) => {
      handle(req, res);
    })
    .listen(port, hostname, () => {
      console.log(`HTTPS frontend running at https://localhost:${port}`);
    });
});
