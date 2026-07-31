FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl \
  && mkdir -p /certs \
  && openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /certs/localhost-key.pem \
    -out /certs/localhost.pem \
    -days 365 \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY

# Make them available during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
