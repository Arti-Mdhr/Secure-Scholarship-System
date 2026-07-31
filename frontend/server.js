const fs = require("fs");
const https = require("https");
const next = require("next");
const path = require("path");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

const certDir = process.env.CERT_DIR || "/certs";
const fallbackCertDir = path.join(__dirname, "../certs");
const keyPath = process.env.HTTPS_KEY_PATH || path.join(certDir, "localhost-key.pem");
const certPath = process.env.HTTPS_CERT_PATH || path.join(certDir, "localhost.pem");

const readCertificate = (filePath, fallbackFilePath) => {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }

  return fs.readFileSync(fallbackFilePath);
};

app.prepare().then(() => {
  const options = {
    key: readCertificate(keyPath, path.join(fallbackCertDir, "localhost-key.pem")),
    cert: readCertificate(certPath, path.join(fallbackCertDir, "localhost.pem")),
  };

  https
    .createServer(options, (req, res) => {
      handle(req, res);
    })
    .listen(port, hostname, () => {
      console.log(`HTTPS frontend running at https://localhost:${port}`);
    });
});
