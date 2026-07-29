# Lightweight official Node.js image
FROM node:22-alpine

# Working directory
WORKDIR /app

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