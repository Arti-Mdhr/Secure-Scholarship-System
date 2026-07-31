# Lightweight official Node.js image
FROM node:22-alpine

# Working directory
WORKDIR /app

# Generate local HTTPS certificates for Docker runtime
RUN apk add --no-cache openssl \
  && mkdir -p /certs \
  && openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /certs/localhost-key.pem \
    -out /certs/localhost.pem \
    -days 365 \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Compile TypeScript
RUN npm run build

# Expose API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
